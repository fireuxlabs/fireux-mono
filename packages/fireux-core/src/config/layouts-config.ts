import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'path'

/**
 * Configure layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)
  const layoutsDir = resolvePath('./runtime/layouts')

  // Register default layout
  addLayout(
    {
      src: join(layoutsDir, 'default.vue'),
      filename: 'fireux-core-default.vue',
    },
    'CoreDefault'
  )

  // Register dashboard layout
  addLayout(
    {
      src: join(layoutsDir, 'dashboard.vue'),
      filename: 'fireux-core-dashboard.vue',
    },
    'CoreDashboard'
  )

  // Register layouts as components for direct use
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    prefix: 'Core',
    global: true,
    pathPrefix: false,
    watch: true,
    transpile: true,
  })

  // Explicitly register layouts in components directories
  nuxt.hook('components:dirs', (dirs: any) => {
    dirs.push({
      path: layoutsDir,
      prefix: 'Core',
      global: true,
    })
  })
}
