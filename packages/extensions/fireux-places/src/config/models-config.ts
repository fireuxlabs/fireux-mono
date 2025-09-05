import type { Resolver } from '@nuxt/kit'
export function configureModels(_resolver: Resolver) {
  // no-op: models are explicit imports via aliases; keep only if we emit global .d.ts later
}
