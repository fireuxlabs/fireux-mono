import type { Resolver } from '@nuxt/kit'
import { registerComposablesDir } from 'fireux-core/config/module/module-helpers'

export function configureComposables(resolver: Resolver) {
  registerComposablesDir(resolver)
}
