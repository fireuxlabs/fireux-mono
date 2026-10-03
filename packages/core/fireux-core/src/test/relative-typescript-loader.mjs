import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Node fixtures import authored Nuxt TypeScript with extensionless relative paths.
// Preserve Node resolution first; this does not change application resolution.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) {
      throw error
    }
    for (const suffix of ['.ts', '.js', '/index.ts']) {
      const url = new URL(specifier + suffix, context.parentURL)
      if (existsSync(fileURLToPath(url))) {
        return nextResolve(url.href, context)
      }
    }
    throw error
  }
}
