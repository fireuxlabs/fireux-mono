import { addComponentsDir } from '@nuxt/kit'
export function configureComponents(resolver: any, opts?: { prefix?: string }) {
  addComponentsDir({
    path: resolver.resolve('../runtime/components'),
    prefix: opts?.prefix ?? 'Fire',
    global: false,
    pathPrefix: false
  })
}
