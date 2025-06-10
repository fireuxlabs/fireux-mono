import { addComponentsDir } from '@nuxt/kit'
import { ModuleOptions } from './module'

/**
 * Configure components for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param options Module options containing component prefix
 */
export function configureComponents(resolver: any, options: ModuleOptions) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Register components
  addComponentsDir({
    path: resolvePath('./runtime/components'),
    pattern: '**/*.vue',
    prefix: options.prefix,
    global: true,
    pathPrefix: true,
    watch: true,
  })
}
