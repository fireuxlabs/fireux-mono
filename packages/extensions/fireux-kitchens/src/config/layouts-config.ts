import { addComponentsDir } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureLayouts(resolver: any, _nuxt: any) {
  const dir = resolver.resolve('./runtime/layouts')
  if (!existsSync(dir)) return
  addComponentsDir({
    path: dir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })
}
