import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export function configureLayouts(resolver: any, _nuxt?: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register layouts as components for direct use
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })

  // Register Nuxt layout keys if files exist
  for (const key of ['FireuxDefault', 'FireuxDashboard', 'FireuxDev']) {
    const f = join(layoutsDir, `${key}.vue`)
    if (existsSync(f)) addLayout({ src: f, filename: `fireux-${key}.vue` }, key)
  }
}
