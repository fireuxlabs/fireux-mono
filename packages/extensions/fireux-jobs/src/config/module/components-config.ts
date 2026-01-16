import { addComponentsDir, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

/**
 * Register runtime components for this module.
 */
export function configureComponents(
	resolver: Resolver,
	options: { prefix?: string } = {}
) {
	const baseDir = resolver.resolve('./runtime/components')
	if (existsSync(baseDir)) {
		addComponentsDir({
			path: baseDir,
			pattern: '**/*.vue',
			prefix: options.prefix ?? 'Fire',
			global: false,
			pathPrefix: false,
		})
	}

	const jobDir = resolver.resolve('./runtime/components/organisms/entities/Job')
	if (existsSync(jobDir)) {
		addComponentsDir({
			path: jobDir,
			pattern: '**/*.vue',
			global: true,
			pathPrefix: true,
			prefix: 'Job',
		})
	}
}