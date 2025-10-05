import { addServerHandler } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureServer(resolver: any) {
  // Register only actively used server routes to keep the surface minimal
  const base = resolver.resolve('./runtime/server/api')

  function register(route: string, filename: string) {
    const candidates = [
      `${base}/${filename}.ts`,
      `${base}/${filename}.mjs`,
      `${base}/${filename}.js`,
      `${base}/${filename}.cjs`,
    ]
    const handler = candidates.find((path) => existsSync(path))
    if (handler) {
      addServerHandler({ route, handler })
    }
  }

  register('/api/places/autocomplete', 'autocomplete.get')
  register('/api/places/details', 'details.get')
  register('/api/places/photo', 'photo.get')
}
