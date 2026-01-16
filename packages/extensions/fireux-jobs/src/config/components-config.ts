import { addComponentsDir, type Resolver } from '@nuxt/kit'

/**
 * Register runtime components for this module.
 */
export function configureComponents(
  resolver: Resolver,
  options: { prefix?: string } = {}
) {
  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    prefix: options.prefix ?? 'Fire',
    global: false,
    pathPrefix: false,
  })

  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/entities/Job'),
    global: true,
    pathPrefix: true,
    prefix: 'Job',
  })
}
