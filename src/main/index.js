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
  tool: null
}
const mainURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const toolURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/tool`
  : `file://${__dirname}/index.html#/tool`

function createWindow () {
  if (appWindows.main !== null) return

  const main = appWindows.main = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    width: 1440,
    height: 900,
    show: false
  })

  main.loadURL(mainURL)
  main.once('ready-to-show', () => {
    main.show()

    main.on('focus', () => {
      if (appWindows.tool) appWindows.tool.showInactive()
    })
    main.on('blur', () => {
      if (appWindows.tool) appWindows.tool.hide()
    })

    ipcMain.on('main-message', (event, data) => {
      main.webContents.send('message', data)
    })
  })

  main.on('closed', () => {
    appWindows.main = null
  })
}

function createToolWindow () {
  if (appWindows.tool !== null) return

  const tool = appWindows.tool = new BrowserWindow({
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

  tool.setAlwaysOnTop(true, 'floating')
  tool.loadURL(toolURL)
  tool.once('ready-to-show', () => {
    tool.show()

    ipcMain.on('tool-message', (event, data) => {
      tool.webContents.send('message', data)
    })
  })

  tool.on('closed', () => {
    appWindows.tool = null
  })
}

function createStartWindows () {
  createWindow()
  createToolWindow()
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
