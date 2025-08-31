import { addComponentsDir } from '@nuxt/kit'
export function configureComponents(
  resolver: any,
  options: { prefix?: string } = {}
) {
  addComponentsDir({
    path: resolver.resolve('../runtime/components'),
    prefix: options.prefix ?? 'Fire',
    global: false,
    pathPrefix: false,
  })
}
