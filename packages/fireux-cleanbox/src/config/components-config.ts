import { addComponentsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export interface ModuleOptions {
  prefix?: string
}

export function configureComponents(
  resolver: Resolver,
  options: ModuleOptions
) {
  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    prefix: options.prefix || 'Clean',
    pathPrefix: false,
  })

  console.log(
    `🧽 CleanBox components registered with prefix: ${options.prefix || 'Clean'}`
  )
}
