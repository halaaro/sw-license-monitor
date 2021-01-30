'use strict'

import { app, protocol, ipcMain } from 'electron'
import { installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import { createWindow } from './window'
import logger from 'electron-log'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

const hasLock = app.requestSingleInstanceLock()
if (!hasLock) {
  app.quit()
} else {
  const { autoUpdater } = require('electron-updater')
  autoUpdater.logger = require('electron-log')
  autoUpdater.logger.transports.file.level = 'info'
  autoUpdater.checkForUpdatesAndNotify()

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      win.setAlwaysOnTop(true)
      setTimeout(() => win.setAlwaysOnTop(false), 500)
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      try {
        logger.info('installing Vue Dev Tools')
        await installVueDevtools()
      } catch (e) {
        logger.error(e, 'Vue Devtools failed to install')
      }
    }
    logger.info('creating window')
    win = createWindow()
    win.on('closed', () => {
      win = null
    })

    // required for notifications
    app.setAppUserModelId('com.haleytec.sw-license-monitor')
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    win = createWindow()
    win.on('closed', () => {
      win = null
    })
  }
})

// fix for issues https://github.com/electron/electron/issues/1335
// app.disableHardwareAcceleration()

ipcMain.on('notification-click', () => {
  win.setAlwaysOnTop(true)
  setTimeout(() => win.setAlwaysOnTop(false), 500)
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
