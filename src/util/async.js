/**
 * Asynchronous sleep-like function that resolves after the given time period.
 * @param {number} time milliseconds to wait
 */
export async function wait (time) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time)
  })
}

/**
 * Attempt to resolve promise returned by `func` a number of times before
 * giving up. If the promise is rejected, any errors are silently ignored and
 * another attempt is made after waiting `timeout` milliseconds. Once
 * `maxRetries` attempts have been made, the last reject is honored.
 * @param {Number} numRetries maximum number of times to retry
 * @param {Number} timeout time to wait before retrying
 * @param {Function<Promise>} func function returning a promise
 */
export async function retryAsync (numRetries, timeout, func) {
  for (let i = 0; i < numRetries; i++) {
    try {
      return await func()
    } catch (err) {
      if (i === numRetries - 1) {
        throw err
      } else {
        await wait(timeout)
      }
    }
  }
}
