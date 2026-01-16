import { addServerHandler, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureServer(resolver: Resolver) {
	const handler = resolver.resolve(
		'./runtime/server/api/stripe/create-product.post'
	)
	if (!existsSync(handler)) return

	addServerHandler({
		route: '/api/stripe/create-product',
		handler,
	})
}