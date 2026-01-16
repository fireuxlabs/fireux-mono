import { addComponentsDir, type Resolver } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import { existsSync } from 'node:fs';

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver, nuxt: Nuxt) {
	const componentsDir = resolver.resolve('./runtime/components')
	if (!existsSync(componentsDir)) return

	;(nuxt.options.alias ||= {}) as Record<string, string>
	;(nuxt.options.alias as Record<string, string>)['#fireux-fireux-components'] =
		componentsDir

	addComponentsDir({
		path: componentsDir,
		pattern: '**/*.vue',
		global: false,
		pathPrefix: true,
		// Ensure ecosystem components override core defaults
		priority: 1,
	})
}