import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Configure cleanbox layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, _nuxt: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register layouts as components for direct use
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })

  for (const key of ['CleanboxDefault', 'CleanboxDashboard', 'CleanboxDev']) {
    const f = join(layoutsDir, `${key}.vue`)
    if (existsSync(f))
      addLayout({ src: f, filename: `cleanbox-${key}.vue` }, key)
  }
}
