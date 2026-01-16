import { addComponentsDir, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver) {
	const dir = resolver.resolve('./runtime/components/organisms/entities/Company')
	if (!existsSync(dir)) return
	addComponentsDir({
		path: dir,
		pattern: '**/*.vue',
		global: true,
		pathPrefix: true,
		prefix: 'Company',
	})
}