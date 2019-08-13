/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Set environment for development
// process.env.NODE_ENV = 'development'

// Install `electron-debug` with `devtron`
const { app } = require('electron')
const electronDebug = require('electron-debug')
const installExtension = require('electron-devtools-installer')

electronDebug({ showDevTools: true })
app.on('ready', () => {
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch(err => {
      console.log(err)
    })
})

// Require `main` process to boot app
require('./index')
