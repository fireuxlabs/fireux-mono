import { addServerHandler } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureServer(resolver: any) {
  // Register only actively used server routes to keep the surface minimal
  const base = resolver.resolve('./runtime/server/api')

  // Places autocomplete endpoint
  const autocomplete = `${base}/autocomplete.get.ts`
  if (existsSync(autocomplete)) {
    addServerHandler({
      route: '/api/places/autocomplete',
      handler: autocomplete,
    })
  }

  // Places details endpoint
  const details = `${base}/details.get.ts`
  if (existsSync(details)) {
    addServerHandler({ route: '/api/places/details', handler: details })
  }
}
