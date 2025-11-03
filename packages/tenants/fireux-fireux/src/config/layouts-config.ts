import { addComponentsDir } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureLayouts(resolver: any, _nuxt?: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register layouts as components for direct use
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    prefix: 'Fireux',
    global: true,
    pathPrefix: false,
  })
}
