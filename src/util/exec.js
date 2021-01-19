import { exec } from 'child_process'

/**
 * Wrap child_process.exec in promise and return stdout and stderr.
 * @param {String} command command line to execute
 * @param {Object} [options] passed unmodified to exec
 * @returns {Object} `{ stdout, stderr }`
 */
export async function execPromise (command, options) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        const err = new Error(error.message)
        err.data = { error, stdout, stderr }
        reject(err)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}
