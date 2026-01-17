import { addServerHandler, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function registerAppServerHandler(
  resolver: Resolver,
  route = '/api/app'
) {
  const appGet = resolver.resolve('../runtime/server/api/app.get.ts')
  if (existsSync(appGet)) {
    addServerHandler({ route, handler: appGet })
  }
}