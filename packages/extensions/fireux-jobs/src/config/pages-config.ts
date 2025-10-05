import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

type LayerEntry = string | [string, { config?: Record<string, unknown> }?]

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  const layerSrc = resolver.resolve('./runtime')
  if (!layerSrc) return

  const entry: LayerEntry = [layerSrc, { config: { srcDir: layerSrc } }]
  const extendsValue = nuxt.options.extends
  const extendsArr: LayerEntry[] = []

  if (Array.isArray(extendsValue)) {
    extendsArr.push(...(extendsValue as LayerEntry[]))
  } else if (extendsValue) {
    extendsArr.push(extendsValue as LayerEntry)
  }

  nuxt.options.extends = extendsArr

  const alreadyIncluded = extendsArr.some((layer) => {
    const src = Array.isArray(layer) ? layer[0] : layer
    return src === layerSrc
  })

  if (!alreadyIncluded) extendsArr.push(entry)
}
