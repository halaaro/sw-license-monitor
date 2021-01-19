import { remote } from 'electron'

/**
 * Get root path for bundled (deployed) or non-bundled (dev) files.
 * @returns {String} absolute path to root folder
 */
export function getRootPath () {
  return remote.app
    .getAppPath()
    .replace(
      /\\(dist_electron|app.asar)/,
      ''
    )
}
