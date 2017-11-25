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

import {
  readFile,
  writeFile
} from 'fs-extra'
import {
  basename
} from 'path'

import { createMessageSocket } from './io/socket'
import { createMenuTemplate } from './menu'

const IS_DEV = process.env.NODE_ENV === 'development'
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

const mainURL = IS_DEV
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const paletteURL = IS_DEV
  ? `http://localhost:9080/#/palette`
  : `file://${__dirname}/index.html#/palette`

const store = new Store()

function createMenu () {
  if (appMenus.main !== null) return

  const fileTypeFilters = [
    {
      name: 'Bacterium Scene',
      extensions: ['bctm']
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
    toggleSimulation () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'key-command', {code: 'Space'})
        // FIXME: Inconsistent key input capturing after toggling menu item state
        // toggleMenuItem('simulation')
      }
    },
    deleteLastSegment () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'key-command', {code: 'Cmd+Backspace'})
      }
    },
    deleteLastVertex () {
      if (appWindows.main && appWindows.main.isFocused()) {
        sendWindowMessage('main', 'key-command', {code: 'Backspace'})
      }
    },
    togglePalette () {
      toggleWindow('palette')
      toggleMenuItem('palette')
    },
    sendFeedback () {
      shell.openExternal('mailto:jay.patrick.weeks@gmail.com')
    }
  })

  const menu = appMenus.main = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function openSceneFile (path) {
  readFile(path, 'utf8')
    .then((data) => {
      setMenuState('simulation-toggle', 'checked', false)
      setWindowFilePath('main', path)
      sendWindowMessage('main', 'deserialize-scene', data)
    })
}

function saveSceneFile (path) {
  requestWindowResponse('main', 'serialize-scene', null)
    .then((data) => JSON.stringify(data))
    .then((str) => writeFile(path, str))
    .then(() => {
      setWindowFilePath('main', path)
      console.log(`Saved scene to ${path}.`)
    })
    .catch((err) => {
      throw err
    })
}

function restoreLastSession () {
  ipcMain.on('main-started', () => {
    const openScenePath = store.get('openScenePath')
    if (!openScenePath) return
    openSceneFile(openScenePath)
  })
}

function createMainWindow () {
  if (appWindows.main !== null) return
  const createSceneMenuItem = appMenus.main.getMenuItemById('create-scene')

  const windowSize = {
    width: DEBUG_MAIN ? 1600 : 1200,
    height: 1200
  }

  const main = appWindows.main = new BrowserWindow({
    titleBarStyle: DEBUG_MAIN ? null : 'hiddenInset',
    backgroundColor: '#A9D3DC',
    width: windowSize.width,
    height: windowSize.height,
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

  createSceneMenuItem.enabled = false
  main.loadURL(mainURL)
  ipcMain.on('main-message', onMessage)
  main.on('focus', onWindowFocus)
  main.on('blur', onWindowBlur)

  main.on('closed', () => {
    ipcMain.removeListener('main-message', onMessage)
    createSceneMenuItem.enabled = true
    appWindows.main = null
  })
}

function createPaletteWindow (displaySize) {
  if (appWindows.palette !== null) return

  const windowSize = {
    width: DEBUG_PALETTE ? 1200 : 320,
    height: 800
  }

  const palette = appWindows.palette = new BrowserWindow({
    x: (displaySize.width - 1200) / 2 - windowSize.width + 10,
    y: (displaySize.height - windowSize.height) / 2,
    width: windowSize.width,
    minWidth: 320,
    maxWidth: DEBUG_PALETTE ? null : 320,
    height: windowSize.height,
    minHeight: 600,
    backgroundColor: DEBUG_PALETTE ? '#444444' : null,
    frame: DEBUG_PALETTE,
    focusable: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreen: false,
    fullscreenable: false,
    hasShadow: false,
    vibrancy: 'dark',
    show: false,
    alwaysOnTop: !DEBUG_PALETTE,
    webPreferences: {
      // TODO: Would be nice to have native-feeling bounce ...
      scrollBounce: false,
      devTools: DEBUG_PALETTE
    }
  })

  palette.loadURL(paletteURL)
  palette.on('blur', onWindowBlur)

  palette.once('ready-to-show', () => {
    palette.show()

    ipcMain.on('palette-message', (event, data) => {
      sendWindowMessage('palette', 'message', data)
    })
  })

  palette.on('closed', () => {
    appWindows.palette = null
  })
}

let paletteIsHidden = false
function onWindowFocus () {
  if (paletteIsHidden && appWindows.palette) {
    appWindows.palette.show()
    paletteIsHidden = false
  }
}
function onWindowBlur () {
  if (appWindows.palette && !BrowserWindow.getFocusedWindow()) {
    appWindows.palette.hide()
    paletteIsHidden = true
  }
}

function createStartWindows () {
  const displaySize = screen.getPrimaryDisplay().workAreaSize
  createMenu()
  createMainWindow(displaySize)
  createPaletteWindow(displaySize)
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

function setMenuState (name, key, value) {
  const item = appMenus.main.getMenuItemById(name)
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

ipcMain.on('external-message', (event, data) => {
  if (!ENABLE_IPC_EXTERNAL) return
  ipcExternal.send(data)
})

ipcMain.on('toggle-window', (event, data) => {
  toggleWindow('palette')
  toggleMenuItem('palette')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', createStartWindows)
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
