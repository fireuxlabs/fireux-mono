import { addComponentsDir, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver) {
  const dir = resolver.resolve('./runtime/components/organisms/entities/Place')
  if (!existsSync(dir)) return
  addComponentsDir({
    path: dir,
    pattern: '**/*.vue',
    prefix: 'Place',
    global: true,
    pathPrefix: true,
  })
}