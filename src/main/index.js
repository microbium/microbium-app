'use strict'

import {
  app,
  ipcMain,
  dialog,
  screen,
  shell,
  BrowserWindow,
  Menu
} from 'electron'
import Store from 'electron-store'
import log from 'electron-log'
import createVideoRecorder from '@jpweeks/electron-recorder'

import {
  readFile,
  writeFile,
  rename as renameFile
} from 'fs-extra'
import {
  basename,
  dirname,
  join as pathJoin
} from 'path'
import {
  deflateSync,
  inflateSync
} from 'zlib'

import { isHighSierra } from './utils/platform'
import { fitRect } from './utils/window'
import { createMessageSocket } from './io/socket'
import { createMenuTemplate } from './ui/menu'
import { createPaletteTouchBar, createEditorTouchBar } from './ui/touchbar'
import { exportSceneHTML } from './exporters/html'

const IS_DEV = process.env.NODE_ENV === 'development'
const LOG_LEVEL_FILE = 'warn'
const ENABLE_IPC_EXTERNAL = false
const DEBUG_MAIN = false
const DEBUG_PALETTE = false

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (!IS_DEV) {
  global.__static = pathJoin(__dirname, '/static').replace(/\\/g, '\\\\')
} else {
  global.__static = __static
}

log.transports.file.level = LOG_LEVEL_FILE

const ipcExternal = ENABLE_IPC_EXTERNAL
  ? createMessageSocket(41234, 'localhost')
  : null

const appMenus = {
  main: null
}
const appTouchBars = {
  main: null,
  palette: null
}
const appWindows = {
  main: null,
  palette: null
}
const paletteVisibility = {
  isHidden: false,
  isHiddenUser: false
}
const paletteState = {
  activeId: 'tool',
  lineTool: null,
  styles: null,
  constraintGroups: null
}
const editorState = {
  isSimRunning: false,
  isSimPaused: false
}

const mainURL = IS_DEV
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const paletteURL = IS_DEV
  ? `http://localhost:9080/#/palette`
  : `file://${__dirname}/index.html#/palette`

const store = new Store()
let appIsReady = false
let appShouldQuit = false

// TODO: Cleanup actions
const appActions = createAppActions()
function createAppActions () {
  // TODO: Cleanup file filters
  const fileTypeFilters = [{
    name: 'Microbium Scene',
    extensions: ['mcrbm']
  }]
  const imageTypeFilters = [{
    name: 'Images',
    extensions: ['png']
  }]
  const jsonTypeFilters = [{
    name: 'JSON',
    extensions: ['json']
  }]
  const htmlTypeFilters = [{
    name: 'HTML',
    extensions: ['html']
  }]
  const videoTypeFilters = [{
    name: 'Videos',
    extensions: ['mov']
  }]

  return {
    createNewScene () {
      store.set('openScenePath', null)
      createMainWindow()
    },

    openScene () {
      dialog.showOpenDialog(null, {
        openDirectory: false,
        multiSelections: false,
        filters: fileTypeFilters
      }, (fileNames) => {
        if (!(fileNames && fileNames.length)) return
        const fileName = fileNames[0]
        store.set('openScenePath', fileName)
        openSceneFile(fileName)
      })
    },

    saveScene (useOpenScene) {
      const openScenePath = store.get('openScenePath')
      if (useOpenScene && openScenePath) {
        saveSceneFile(openScenePath)
        return
      }
      dialog.showSaveDialog(null, {
        filters: fileTypeFilters
      }, (fileName) => {
        if (!fileName) return
        store.set('openScenePath', fileName)
        saveSceneFile(fileName)
      })
    },

    revertScene () {
      const fileName = store.get('openScenePath')
      if (!fileName) return
      if (store.get('dontAskRevertScene')) {
        openSceneFile(fileName)
        return
      }
      dialog.showMessageBox(appWindows.main, {
        type: 'question',
        buttons: ['OK', 'Cancel'],
        defaultId: 1,
        message: 'Revert to saved version of scene?',
        detail: 'This will revert your current changes and cannot be undone.',
        checkboxLabel: "Don't ask me again",
        checkboxChecked: false
      }, (id, checkboxChecked) => {
        if (id === 0) {
          openSceneFile(fileName)
          if (checkboxChecked) store.set('dontAskRevertScene', true)
        }
      })
    },

    saveFrameImage () {
      dialog.showSaveDialog(null, {
        filters: imageTypeFilters
      }, (fileName) => {
        if (!fileName) return
        saveFrameImageFromCanvas(fileName)
      })
    },

    exportJSON () {
      dialog.showSaveDialog(null, {
        filters: jsonTypeFilters
      }, (fileName) => {
        if (!fileName) return
        exportSceneFile(fileName)
      })
    },

    exportHTML () {
      dialog.showSaveDialog(null, {
        filters: htmlTypeFilters
      }, (fileName) => {
        if (!fileName) return
        requestWindowResponse('main', 'serialize-scene', null)
          .then((data) => exportSceneHTML(fileName, data))
      })
    },

    toggleSimulation () {
      if (appWindows.main && appWindows.main.isFocused()) {
        toggleSimulationState()
        sendWindowMessage('main', 'command',
          {action: 'SIMULATION_TOGGLE'})
        // FIXME: Inconsistent key input capturing after toggling menu item state
        // toggleMenuItem('simulation')
      }
    },

    toggleSimulationPause () {
      toggleSimulationPauseState()
      sendWindowMessage('main', 'command',
        {action: 'SIMULATION_TOGGLE_PAUSE'})
    },

    toggleStatus () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'command',
          {action: 'VIEWPORT_TOGGLE_STATS'})
        toggleMenuItem('status')
      }
    },

    deleteLastSegment () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'command',
          {action: 'GEOMETRY_DELETE_LAST_SEGMENT'})
      }
    },

    deleteLastVertex () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'command',
          {action: 'GEOMETRY_DELETE_LAST_VERTEX'})
      }
    },

    completeSegment () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'command',
          {action: 'GEOMETRY_COMPLETE_ACTIVE_SEGMENT'})
      }
    },

    setStrokeWidth (value) {
      sendWindowMessage('palette', 'command',
        {action: 'SET_STROKE_WIDTH', value})
    },

    setInputModType (value) {
      sendWindowMessage('palette', 'command',
        {action: 'SET_INPUT_MOD_TYPE', value})
    },

    selectStyleLayer (index) {
      sendWindowMessage('palette', 'command',
        {action: 'SELECT_STYLE_LAYER', index})
    },

    selectNextStyleLayer (dir) {
      sendWindowMessage('palette', 'command',
        {action: 'SELECT_NEXT_STYLE_LAYER', dir})
    },

    selectConstraintGroup (index) {
      sendWindowMessage('palette', 'command',
        {action: 'SELECT_CONSTRAINT_GROUP', index})
    },

    selectNextConstraintGroup (dir) {
      sendWindowMessage('palette', 'command',
        {action: 'SELECT_NEXT_CONSTRAINT_GROUP', dir})
    },

    togglePalette () {
      paletteVisibility.isHiddenUser = !paletteVisibility.isHiddenUser
      toggleWindow('palette')
      toggleMenuItem('palette')
    },

    setActivePalette (id) {
      syncActivePalette(id)
      sendWindowMessage('palette', 'command',
        {action: 'SET_ACTIVE_PALETTE', id})
    },

    setAspectRatio (aspect) {
      setWindowAspectRatio('main', aspect)
    },

    reportIssue () {
      shell.openExternal('https://github.com/microbium/microbium-app-issues')
    },

    sendFeedback () {
      shell.openExternal('mailto:jay.patrick.weeks@gmail.com')
    },

    startScreenRecording () {
      setMenuState('start-screen-recording', 'enabled', false)
      setMenuState('stop-screen-recording', 'enabled', true)
      startWindowScreenRecording('main')
    },

    stopScreenRecording () {
      setMenuState('start-screen-recording', 'enabled', true)
      setMenuState('stop-screen-recording', 'enabled', false)
      stopWindowScreenRecording('main')
        .then((recording) => {
          dialog.showSaveDialog(null, {
            filters: videoTypeFilters
          }, (fileName) => {
            if (!fileName) return
            saveScreenRecording(recording, fileName)
          })
        })
    }
  }
}

// ------------------------------------------------------------
// Application Menu
// ----------------

function createMenu () {
  if (appMenus.main !== null) return

  const template = createMenuTemplate(app, appActions)
  const menu = appMenus.main = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ------------------------------------------------------------
// Main TouchBar
// -------------

function createTouchBar () {
  appTouchBars.palette = createPaletteTouchBar(appActions)
  appTouchBars.editor = createEditorTouchBar(appActions)
}

// ------------------------------------------------------------
// Main Window
// -----------

function createMainWindow () {
  if (appWindows.main !== null) return
  const displaySize = getDisplaySize()

  const transform = fitRect(displaySize, {
    padding: 60,
    aspect: displaySize.width / displaySize.height,
    alignX: 0.5,
    alignY: 0.5
  })

  const main = appWindows.main = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#222222',
    x: transform.x,
    y: transform.y,
    width: transform.width,
    height: transform.height,
    show: true,
    webPreferences: {
      devTools: DEBUG_MAIN
    }
  })

  // TODO: Should probably save state in main process
  // then sync to windows .. this is fine for now
  const onMessage = (event, data) => {
    sendWindowMessage('main', 'message', data)
  }

  setMenuState('create-scene', 'enabled', false)
  setMenuState('revert-scene', 'enabled', true)

  main.setTouchBar(appTouchBars.editor)
  main.loadURL(mainURL)
  onWindowFocus()

  main.on('focus', onWindowFocus)
  main.on('blur', onWindowBlur)
  ipcMain.on('main-message', onMessage)
  ipcMain.on('main+menu-message', onMessage)
  ipcMain.on('menu-message', onMenuMessage)
  ipcMain.on('main+menu-message', onMenuMessage)

  main.on('closed', () => {
    ipcMain.removeListener('main-message', onMessage)
    setMenuState('create-scene', 'enabled', true)
    setMenuState('revert-scene', 'enabled', false)
    appWindows.main = null
  })
}

// ------------------------------------------------------------
// Palette Window
// --------------

function createPaletteWindow () {
  if (appWindows.palette !== null) return

  const displaySize = getDisplaySize()
  const windowSize = {
    width: 320,
    height: Math.min(800,
      Math.round(displaySize.height * (2 / 3)))
  }

  const palette = appWindows.palette = new BrowserWindow({
    x: 20,
    y: Math.round((displaySize.height - windowSize.height) / 3),
    width: windowSize.width,
    minWidth: 320,
    maxWidth: DEBUG_PALETTE ? 900 : 420,
    height: windowSize.height,
    minHeight: 500,
    backgroundColor: null,
    frame: false,
    focusable: true,
    resizable: true,
    closable: true, // FIXME: Setting false prevents app quit ...
    minimizable: false,
    maximizable: false,
    fullscreen: false,
    fullscreenable: false,
    hasShadow: true,
    vibrancy: 'dark',
    transparent: isHighSierra(),
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      // TODO: Would be nice to have native-feeling bounce ...
      scrollBounce: false,
      devTools: DEBUG_PALETTE
    }
  })

  palette.setTouchBar(appTouchBars.palette)
  palette.loadURL(paletteURL)
  palette.on('blur', onWindowBlur)

  palette.once('ready-to-show', () => {
    if (DEBUG_PALETTE) {
      palette.webContents.openDevTools({mode: 'detach'})
    }
    palette.showInactive()
    ipcMain.on('palette+menu-message', onMenuMessage)
    ipcMain.on('palette-message', (event, data) => {
      sendWindowMessage('palette', 'message', data)
    })
  })

  palette.on('close', (event) => {
    if (appShouldQuit) return
    event.preventDefault()
    paletteVisibility.isHiddenUser = !paletteVisibility.isHiddenUser
    toggleWindow('palette')
    toggleMenuItem('palette')
  })
  palette.on('closed', () => {
    appWindows.palette = null
  })
}

// ------------------------------------------------------------
// Window Management
// -----------------

function onWindowFocus () {
  if (DEBUG_PALETTE) return
  if (paletteVisibility.isHidden &&
    !paletteVisibility.isHiddenUser &&
    appWindows.palette) {
    appWindows.palette.showInactive()
    paletteVisibility.isHidden = false
  }
}
function onWindowBlur () {
  if (DEBUG_PALETTE) return
  if (appWindows.palette && !BrowserWindow.getFocusedWindow()) {
    appWindows.palette.hide()
    paletteVisibility.isHidden = true
  }
}

function getDisplaySize () {
  return screen.getPrimaryDisplay().workAreaSize
}

function createStartWindows () {
  createMenu()
  createTouchBar()
  createMainWindow()
  createPaletteWindow()
  restoreLastSession()
}

function toggleWindow (name) {
  const win = appWindows[name]
  if (!win) return

  if (win.isVisible()) win.hide()
  else win.showInactive()
}

function setWindowFilePath (name, fullPath) {
  const win = appWindows[name]
  if (!win) return
  const fileName = basename(fullPath)
  sendWindowMessage('main', 'message', {
    type: 'UPDATE_FILE_PATH',
    fullPath,
    fileName
  })
  win.setTitle(fileName)
  win.setRepresentedFilename(fullPath)
}

// TODO: Ensure resized window fits within screen
function setWindowAspectRatio (name, aspect) {
  const win = appWindows[name]
  if (!win) return

  if (aspect === 0) {
    win.setAspectRatio(aspect)
    return
  }

  const size = win.getSize()
  const targetWidth = Math.round(size[1] * aspect)
  const targetHeight = size[1]

  win.setSize(targetWidth, targetHeight)
  win.setAspectRatio(aspect)
}

function sendWindowMessage (name, messageKey, messageData) {
  const win = appWindows[name]
  if (!win) return
  win.send(messageKey, messageData)
  return win
}

function requestWindowResponse (name, messageKey, messageData) {
  const win = sendWindowMessage(name, messageKey, messageData)
  if (!win) {
    return Promise.reject(
      new Error(`window ${name} does not exist`))
  }
  return new Promise((resolve, reject) => {
    ipcMain.once(`${messageKey}--response`, (event, data) => {
      resolve(data)
    })
  })
}

// ------------------------------------------------------------
// Scene Persistence
// -----------------

function openSceneFile (path) {
  createMainWindow()
  readFile(path, null)
    .then((buf) => inflateSync(buf))
    .then((data) => {
      setMenuState('revert-scene', 'enabled', true)
      setMenuState('simulation-toggle', 'checked', false)
      setWindowFilePath('main', path)
      sendWindowMessage('main', 'deserialize-scene', data)
    })
    .catch((err) => {
      log.error(err)
    })
}

function saveSceneFile (path) {
  requestWindowResponse('main', 'serialize-scene', null)
    .then((data) => JSON.stringify(data))
    .then((str) => deflateSync(str))
    .then((buf) => writeFile(path, buf))
    .then(() => {
      setWindowFilePath('main', path)
      console.log(`Saved scene to ${path}.`)
    })
    .catch((err) => {
      log.error(err)
    })
}

function exportSceneFile (path) {
  requestWindowResponse('main', 'serialize-scene', null)
    .then((data) => JSON.stringify(data))
    .then((buf) => writeFile(path, buf))
    .then(() => {
      console.log(`Exported scene to ${path}.`)
    })
    .catch((err) => {
      log.error(err)
    })
}

function restoreLastSession () {
  ipcMain.on('main-will-start', () => {
    const openScenePath = store.get('openScenePath')
    if (!openScenePath) return
    openSceneFile(openScenePath)
  })
}

// ------------------------------------------------------------
// Screen Recording
// ----------------

const activeRecordings = {}
function startWindowScreenRecording (name) {
  const win = appWindows[name]
  if (!win || activeRecordings[name]) {
    return Promise.reject(
      new Error(`window ${name} does not exist or recording has started`))
  }

  const output = pathJoin(dirname(store.path), 'temp-output.mov')
  const video = createVideoRecorder(win, {
    // FIXME: Path is wrong in built app
    ffmpeg: '/usr/local/bin/ffmpeg',
    fps: 24,
    quality: 100,
    format: 'mov',
    output
  })
  const recording = activeRecordings[name] = {
    isRecording: true,
    output,
    video
  }

  function frame () {
    if (recording.isRecording) video.frame(frame)
    else recording.video.end()
  }
  frame()

  return Promise.resolve(recording)
}

function stopWindowScreenRecording (name) {
  const win = appWindows[name]
  const recording = activeRecordings[name]
  if (!(win && recording)) {
    return Promise.reject(
      new Error(`window ${name} does not exist or recording has not started`))
  }

  recording.isRecording = false
  activeRecordings[name] = null

  return Promise.resolve(recording)
}

function saveScreenRecording (recording, fileName) {
  renameFile(recording.output, fileName)
}

// ------------------------------------------------------------
// Canvas Image Exporting
// ----------------------

function saveFrameImageFromCanvas (path) {
  requestWindowResponse('main', 'save-frame', { path })
    .then(() => {
      console.log(`Saved frame image to ${path}.`)
    })
    .catch((err) => {
      log.error(err)
    })
}

// ------------------------------------------------------------
// Menu State
// ----------

function onMenuMessage (event, data) {
  switch (data.type) {
    case 'UPDATE_CONTROLS':
      syncControls(data)
      break
    case 'UPDATE_ACTIVE_PALETTE':
      syncActivePalette(data.id)
      break
  }
}

function syncControls ({ group, key, value }) {
  if (group === null) {
    const { lineTool, styles, constraintGroups } = value
    Object.assign(paletteState, {
      lineTool,
      styles,
      constraintGroups
    })
    syncStrokeControls()
    syncStyleLayers()
    syncConstraintGroups()
  }

  if (group === 'lineTool') {
    Object.assign(paletteState.lineTool, value)
    syncStrokeControls()
    syncStyleLayers()
    syncConstraintGroups()
  }

  if (group === 'styles') {
    paletteState.styles = value
    syncStyleLayers()
  }

  if (group === 'constraintGroups') {
    paletteState.constraintGroups = value
    syncConstraintGroups()
  }
}

function syncStrokeControls () {
  const { lineTool } = paletteState
  appTouchBars.editor.syncStroke(lineTool)
}

function syncStyleLayers () {
  const { styles, lineTool } = paletteState
  const { styleIndex } = lineTool
  setMenuState('prev-style-layer', 'enabled', styleIndex > 0)
  setMenuState('next-style-layer', 'enabled', styleIndex < styles.length - 1)
  appTouchBars.editor.syncStyles(styles)
}

function syncConstraintGroups () {
  const { constraintGroups, lineTool } = paletteState
  const { constraintIndex } = lineTool
  setMenuState('prev-constraint-group', 'enabled', constraintIndex > 0)
  setMenuState('next-constraint-group', 'enabled', constraintIndex < constraintGroups.length - 1)
  appTouchBars.editor.syncConstraintGroups(constraintGroups)
}

function syncActivePalette (id) {
  if (paletteState.activeId === id) return
  paletteState.activeId = id

  setMenuState(`palette-${id}`, 'checked', true)
  appTouchBars.palette.syncActivePalette(id)
}

function setMenuState (name, key, value) {
  const item = appMenus.main.getMenuItemById(name)
  if (!item) {
    throw new Error(`Menu item ${name} does not exist`)
  }
  item[key] = value
}

function toggleMenuItem (name) {
  const menu = appMenus.main

  const menuItemOn = menu.getMenuItemById(name + '-on')
  const menuItemOff = menu.getMenuItemById(name + '-off')

  if (!menuItemOn.enabled) {
    menuItemOn.visible = menuItemOn.enabled = true
    menuItemOff.visible = menuItemOff.enabled = false
  } else {
    menuItemOn.visible = menuItemOn.enabled = false
    menuItemOff.visible = menuItemOff.enabled = true
  }
}

function toggleSimulationState () {
  const isSimRunning = editorState.isSimRunning = !editorState.isSimRunning
  appTouchBars.editor.syncSimulationRunningState(isSimRunning)
}

function toggleSimulationPauseState () {
  const isSimPaused = editorState.isSimPaused = !editorState.isSimPaused
  appTouchBars.editor.syncSimulationPausedState(isSimPaused)
}

// ------------------------------------------------------------

ipcMain.on('external-message', (event, data) => {
  if (!ENABLE_IPC_EXTERNAL) return
  ipcExternal.send(data)
})

ipcMain.on('toggle-window', (event, data) => {
  toggleWindow('palette')
  toggleMenuItem('palette')
})

app.on('open-file', (event, fileName) => {
  log.info('open-file', fileName)
  store.set('openScenePath', fileName)
  if (!appIsReady) return
  if (!appWindows.main) createMainWindow()
  else openSceneFile(fileName)
})
app.on('before-quit', () => {
  appShouldQuit = true
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  appIsReady = true
  createStartWindows()
})
app.on('activate', createStartWindows)

app.commandLine.appendSwitch('--ignore-gpu-blacklist')

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
