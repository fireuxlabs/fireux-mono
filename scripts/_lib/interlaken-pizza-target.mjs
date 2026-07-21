// @fireux-script
// last_used: 2026-07-21
// usage_note: define the one fixed public source, Misebox target, and ignored local output boundary allowed by the Interlaken Pizza audit.
// Concurrent edit — 2026-07-21 23:48 CEST — Interlaken Pizza audit cleanup: isolate the fixed safety boundary from parsing, reads, matching, and reporting.

export const INTERLAKEN_PIZZA_TARGET = Object.freeze({
  projectId: 'misebox-78f9c',
  databaseId: 'misebox',
  databaseEdition: 'STANDARD',
  storageBucket: 'misebox-78f9c.appspot.com',
  appId: 'misebox-app',
  kitchenId: 'ChIJWcym7tulj0cRb3N2twqVj1U',
  menuId: 'pizza-menu',
})

export const INTERLAKEN_PIZZA_SOURCE_URL = 'https://interlakenpizza.ch/menu'

export const INTERLAKEN_PIZZA_OUTPUT_ROOT = 'temp/interlaken-pizza-menu-audit'

export const INTERLAKEN_PIZZA_DEFAULT_MANIFEST = `${INTERLAKEN_PIZZA_OUTPUT_ROOT}/manifest.json`
