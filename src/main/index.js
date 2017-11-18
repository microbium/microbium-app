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

import { createMenuTemplate } from './menu'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const DEBUG_MAIN = false
const DEBUG_PALETTE = false

const appMenus = {
  main: null
}
const appWindows = {
  main: null,
  palette: null
}
const mainURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const paletteURL = process.env.NODE_ENV === 'development'
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
    createScene () {
      createMainWindow()
    },
    openScene () {
      dialog.showOpenDialog(null, {
        openDirectory: false,
        multiSelections: false,
        filters: fileTypeFilters
      }, (fileNames) => {
        if (!fileNames.length) return
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
      sendWindowMessage('main', 'key-command', {code: 'Space'})
      // FIXME: Inconsistent key input capturing after toggling menu item state
      // toggleMenuItem('simulation')
    },
    deleteLastSegment () {
      sendWindowMessage('main', 'key-command', {code: 'Cmd+Backspace'})
      console.log('deleteLastSegment')
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
  const openScenePath = store.get('openScenePath')
  if (!openScenePath) return
  ipcMain.once('main-started', () => {
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
    backgroundColor: '#B2C9CF',
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
    main.webContents.send('message', data)
  }

  createSceneMenuItem.enabled = false
  main.loadURL(mainURL)

  let paletteIsHidden = false
  main.on('focus', () => {
    if (DEBUG_PALETTE) return
    if (paletteIsHidden && appWindows.palette) {
      appWindows.palette.show()
      paletteIsHidden = false
    }
  })
  main.on('blur', () => {
    if (DEBUG_PALETTE) return
    if (appWindows.palette) {
      appWindows.palette.hide()
      paletteIsHidden = true
    }
  })

  ipcMain.on('main-message', onMessage)
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
    focusable: DEBUG_PALETTE,
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
  palette.once('ready-to-show', () => {
    palette.show()

    ipcMain.on('palette-message', (event, data) => {
      palette.webContents.send('message', data)
    })
  })

  palette.on('closed', () => {
    appWindows.palette = null
  })
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

function setWindowFilePath (name, path) {
  const win = appWindows[name]
  if (!win) return
  win.setTitle(basename(path))
  win.setRepresentedFilename(path)
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
