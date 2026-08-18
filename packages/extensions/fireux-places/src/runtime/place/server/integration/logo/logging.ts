const debug = process.env.FIREUX_PLACES_DEBUG === 'true'

export const log = (...args: unknown[]) => {
  if (debug) console.info('[places-logo]', ...args)
}

export const logWarn = (...args: unknown[]) => {
  if (debug) console.warn('[places-logo]', ...args)
}

export const logError = (...args: unknown[]) =>
  console.error('[places-logo]', ...args)
