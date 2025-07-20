import { addComponentsDir } from '@nuxt/kit'

/**
 * Configure cleanbox layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)
  const layoutsDir = resolvePath('./runtime/layouts')

  // Register layouts as components for direct use
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    prefix: 'Cleanbox',
    global: true,
    pathPrefix: false,
    watch: true,
    transpile: true,
  })

  // Explicitly register layouts in components directories
  nuxt.hook('components:dirs', (dirs: any) => {
    dirs.push({
      path: layoutsDir,
      prefix: 'Cleanbox',
      global: true,
    })
  })
}
