import { retryAsync } from './util/async.js'
import { execPromise } from './util/exec.js'
import { getRootPath } from './util/electron.js'

/**
 * Retieve information about all licenses and usage information.
 *
 * Uses the license utility called like:
 * ```cmd
 *    swlmutil.exe lmstat -c {{port}}@{{server}} -f
 * ```
 *
 * Output lines should look something like:
 * ```raw
 *    Users of solidworks:  (Total of 50 licenses issued;  Total of 10 licenses in use)
 *       "solidworks" v20.0, vendor: SW_D, expiry: 1-jan-0
 *       floating license
 *
 *         user1 COMPUTER1 COMPUTER1 (v20.0) (licserver/port 905), start Mon 9/11 5:55
 *         user2 COMPUTER2 COMPUTER2 (v20.0) (licserver/port 1204), start Mon 9/11 7:23
 *    ...
 *
 *    Users of swepdm_cadeditorandweb:  (Total of 50 licenses issued;  Total of 8 licenses in use)
 *
 *      "swepdm_cadeditorandweb" v20.0, vendor: SW_D, expiry: 1-jan-0
 *      floating license
 *
 *        user2 COMPUTER2 COMPUTER2 (v20.0) (licserver/port 1103), start Mon 9/11 7:20
 *    ...
 * ```
 *
 * From this we then parse the output into something like:
 * ```
 * {
 *   licenses: [
 *     {
 *       licenseName: 'solidworks'
 *       total: 50,
 *       inUse: 10,
 *       users: ['user1', 'user2']
 *     },
 *     ...
 *     {
 *       licenseName: 'swepdm_cadeditorandweb'
 *       total: 50,
 *       inUse: 8,
 *       users: ['user2']
 *     },
 *   ]
 * }
 * ```
 * @returns {LicenseInfo} object with license usage information
 */
export default async function getLicenseUsage () {
  const { stdout } = await execPromise(
    'reg query "HKLM\\SOFTWARE\\FLEXlm License Manager" /v SW_D_LICENSE_FILE')
  const licenseServer = stdout.trim().split(/\s+/).pop()
  const rootPath = getRootPath()
  const commandString = `"${rootPath}\\exe\\swlmutil.exe" lmstat -c ${licenseServer} -f`

  const attempt = async () => {
    const { stdout } = await execPromise(commandString)
    return parseLicenseInfo(stdout)
  }
  return retryAsync(5, 2000, attempt)
}

/**
 * @typedef {Object} LicenseSummary
 * @property {String} licenseName
 * @property {Number} inUse
 * */

/**
 * @typedef {Object} LicenseInfo
 * @property {Array<LicenseSummary>} licenses
 */

/**
 * Parse lmustat output and return a list of licenses and usage information.
 * Include a flag if current user is consuming a license.
 * ```
 * @param {String} stdout standard output from swlmutil lmstat command
 * @return {LicenseInfo} an object with array property `licenses`
 */
function parseLicenseInfo (stdout) {
  const usageReggie = /Users of (.*?):.*?([0-9]+) licenses issued.*?([0-9]+) licenses? in use/i
  const userReggie = /^ {4}([^\s])+/

  const licenses = []
  const lines = stdout.split(/\n/)
  let license = null
  for (const line of lines) {
    if (usageReggie.test(line)) {
      if (license) { // found a new license so we are done with the last one
        licenses.push(license)
      }
      const match = usageReggie.exec(line)
      license = {
        licenseName: match[1].toLowerCase(),
        total: parseInt(match[2]),
        inUse: parseInt(match[3]),
        users: []
      }
    } else if (license && userReggie.test(line)) {
      const username = line.match(userReggie)[0].trim()
      license.users.push(username.toLowerCase())
    }
  }
  if (license) {
    licenses.push(license)
  }
  return { licenses }
}
