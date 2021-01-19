import { BrowserWindow, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

export function createWindow () {
  // Create the browser window.

  const bounds = screen.getPrimaryDisplay().bounds

  const win = new BrowserWindow({
    width: 220,
    height: 220,
    transparent: true,
    toolbar: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true
    },
    x: bounds.width - 220 - 10,
    y: 10
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  return win
}
