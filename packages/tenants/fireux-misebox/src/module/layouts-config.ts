// Standardized Misebox tenant layout registration
import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export function configureLayouts(resolver: any, _nuxt: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })

  for (const key of ['MiseboxDefault', 'MiseboxDashboard', 'MiseboxDev']) {
    const f = join(layoutsDir, `${key}.vue`)
    if (existsSync(f)) addLayout({ src: f, filename: `misebox-${key}.vue` }, key)
  }
}
