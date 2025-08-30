import { addComponentsDir } from '@nuxt/kit'

export interface ComponentsOptions {
  prefix?: string
}

export function configureComponents(
  resolver: any,
  options: ComponentsOptions = {}
) {
  // Register ALL runtime components; Nuxt will respect the prefix
  addComponentsDir({
    path: resolver.resolve('../runtime/components'),
    prefix: options.prefix ?? 'Fire',
    global: false,
    pathPrefix: false,
  })
}
