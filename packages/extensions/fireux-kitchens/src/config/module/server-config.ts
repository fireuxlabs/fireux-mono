import { addServerHandler, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureServer(resolver: Resolver) {
	const appGet = resolver.resolve('../runtime/server/api/app.get.ts')
	if (existsSync(appGet)) {
		addServerHandler({ route: '/api/app', handler: appGet })
	}
}