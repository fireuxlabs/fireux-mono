import type { Resolver } from '@nuxt/kit'
import { registerLayoutsDir } from 'fireux-core/config/module/module-helpers'

export function configureLayouts(resolver: Resolver, _nuxt?: any) {
  registerLayoutsDir(resolver)
}
