import { addServerHandler } from '@nuxt/kit'
import { existsSync } from 'node:fs'
export function configureServer(resolver: any) {
  const appGet = resolver.resolve('../runtime/server/api/app.get.ts')
  if (existsSync(appGet))
    addServerHandler({ route: '/api/app', handler: appGet })
}
