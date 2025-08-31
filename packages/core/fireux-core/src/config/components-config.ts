import { addComponentsDir } from '@nuxt/kit'

export function configureComponents(
  resolver: any,
  options: { prefix?: string } = {}
) {
  // Register ALL runtime components; Nuxt will respect the prefix
  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    prefix: options.prefix ?? 'Fire',
  global: false,
  // Use directory path segments in component names so
  // components/layouts/default/Footer.vue => FireLayoutsDefaultFooter
  pathPrefix: true,
  })
}
