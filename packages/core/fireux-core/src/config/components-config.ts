import { addComponentsDir } from '@nuxt/kit'

export function configureComponents(resolver: any) {
  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    pattern: '**/*.vue', // include nested directories
    prefix: 'Fire', // fixed prefix
    global: true, // always available
    pathPrefix: true, // include folder structure in names
  })
}
