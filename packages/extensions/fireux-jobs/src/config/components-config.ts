import { addComponentsDir } from '@nuxt/kit'
import type { ModuleOptions } from '../module'

/**
 * Configure components for the FireUX Jobs module
 * @param resolver The resolver instance to resolve file paths
 * @param options Module options containing component prefix
 */
export function configureComponents(resolver: any, options: ModuleOptions) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Register components with Job prefix to avoid conflicts with core
  addComponentsDir({
    path: resolvePath('./runtime/components'),
    pattern: '**/*.vue',
    prefix: 'Job',
    global: true,
    pathPrefix: true,
    watch: true,
  })
}
