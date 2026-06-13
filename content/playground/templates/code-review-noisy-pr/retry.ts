export const withRetry = async <T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> => {
  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}
