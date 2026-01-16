import { addComponentsDir, type Resolver } from '@nuxt/kit'

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver) {
  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/entities/Blog'),
    global: true,
    pathPrefix: true,
    prefix: 'Blog',
  })
}
