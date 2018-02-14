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

import { createMessageSocket } from './io/socket'
import { createMenuTemplate } from './menu'
import { fitRect } from './window'

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
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

log.transports.file.level = LOG_LEVEL_FILE

const ipcExternal = ENABLE_IPC_EXTERNAL
  ? createMessageSocket(41234, 'localhost')
  : null

const appMenus = {
  main: null
}
const appWindows = {
  main: null,
  palette: null
}
const paletteVisibility = {
  isHidden: false,
  isHiddenUser: false
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

// ------------------------------------------------------------
// Application Menu
// ----------------

function createMenu () {
  if (appMenus.main !== null) return

  const fileTypeFilters = [
    {
      name: 'Bacterium Scene',
      extensions: ['bctm']
    }
  ]
  const videoTypeFilters = [
    {
      name: 'Videos',
      extensions: ['mov']
    }
  ]

  const template = createMenuTemplate(app, {
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
        console.log(id, checkboxChecked)
        if (id === 0) {
          openSceneFile(fileName)
          if (checkboxChecked) store.set('dontAskRevertScene', true)
        }
      })
    },
    toggleSimulation () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'key-command', {code: 'Space'})
        // FIXME: Inconsistent key input capturing after toggling menu item state
        // toggleMenuItem('simulation')
      }
    },
    toggleStatus () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'key-command', {code: 'Cmd+/'})
        toggleMenuItem('status')
      }
    },
    deleteLastSegment () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'key-command', {code: 'Cmd+Backspace'})
      }
    },
    deleteLastVertex () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'key-command', {code: 'X'})
      }
    },
    completeSegment () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'key-command', {code: 'C'})
      }
    },
    togglePalette () {
      paletteVisibility.isHiddenUser = !paletteVisibility.isHiddenUser
      toggleWindow('palette')
      toggleMenuItem('palette')
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
  })

  const menu = appMenus.main = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
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
    backgroundColor: '#53B5C9',
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
  main.loadURL(mainURL)
  onWindowFocus()

  main.on('focus', onWindowFocus)
  main.on('blur', onWindowBlur)
  ipcMain.on('main-message', onMessage)

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
    transparent: true,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      // TODO: Would be nice to have native-feeling bounce ...
      scrollBounce: false,
      devTools: DEBUG_PALETTE
    }
  })

  palette.loadURL(paletteURL)
  palette.on('blur', onWindowBlur)

  palette.once('ready-to-show', () => {
    if (DEBUG_PALETTE) {
      palette.webContents.openDevTools({mode: 'detach'})
    }
    palette.showInactive()
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

function restoreLastSession () {
  ipcMain.on('main-started', () => {
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
// Menu State
// ----------

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
