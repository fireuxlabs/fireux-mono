import { addServerHandler } from '@nuxt/kit'

export function configureServer(resolver: any) {
  // Wire up a few server routes (adjust to your actual file names)
  const base = resolver.resolve('../runtime/server/api')

  addServerHandler({ route: '/api/app', handler: `${base}/app.get.ts` })
  // Add more handlers here as you bring routes online
}
