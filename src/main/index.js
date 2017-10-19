'use strict'

import {
  app,
  BrowserWindow,
  ipcMain
} from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
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

function createMainWindow () {
  if (appWindows.main !== null) return

  const main = appWindows.main = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      devTools: false
    }
  })

  main.loadURL(mainURL)
  main.once('ready-to-show', () => {
    main.show()

    main.on('focus', () => {
      if (appWindows.palette) appWindows.palette.showInactive()
    })
    main.on('blur', () => {
      if (appWindows.palette) appWindows.palette.hide()
    })

    ipcMain.on('main-message', (event, data) => {
      main.webContents.send('message', data)
    })
  })

  main.on('closed', () => {
    appWindows.main = null
  })
}

function createPaletteWindow () {
  if (appWindows.palette !== null) return

  const palette = appWindows.palette = new BrowserWindow({
    width: 320,
    minWidth: 320,
    maxWidth: 320,
    height: 800,
    minHeight: 600,
    frame: false,
    focusable: false,
    resizable: true,
    minimizable: false,
    maximizable: false,
    hasShadow: false,
    vibrancy: 'dark',
    show: false,
    webPreferences: {
      devTools: false
    }
  })

  palette.setAlwaysOnTop(true, 'floating')
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
  createMainWindow()
  createPaletteWindow()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', createStartWindows)
app.on('activate', createStartWindows)

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
