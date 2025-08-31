import { addServerHandler } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureServer(resolver: any) {
  // Wire up a few server routes (adjust to your actual file names)
  const base = resolver.resolve('./runtime/server/api')

  const handler = `${base}/app.get.ts`
  if (existsSync(handler)) {
    addServerHandler({ route: '/api/app', handler })
  }
  // Add more handlers here as you bring routes online
}
