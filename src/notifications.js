import { ipcRenderer } from 'electron'

var notifyTimeout = 0
export function notify (title, body) {
  if (notifyTimeout) return // skip notification if timeout has not been reset
  let myNotification = new Notification(title, { body })

  myNotification.onclick = () => {
    ipcRenderer.sendSync('notification-click')
  }

  notifyTimeout = 1
  setTimeout(() => (notifyTimeout = 0), 5 * 60 * 60 * 1000) // wait before allowing more notifications
}
