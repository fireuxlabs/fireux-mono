import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Configure misebox layouts for the Nuxt application
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

  // Optionally register as Nuxt layout keys
  for (const key of ['MiseboxDefault', 'MiseboxDashboard', 'MiseboxDev']) {
    const f = join(layoutsDir, `${key}.vue`)
    if (existsSync(f))
      addLayout({ src: f, filename: `misebox-${key}.vue` }, key)
  }
}
