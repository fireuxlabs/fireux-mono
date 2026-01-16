import { addImportsDir, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureComposables(resolver: Resolver) {
	const dir = resolver.resolve('./runtime/composables')
	if (!existsSync(dir)) return
	addImportsDir(dir)
}