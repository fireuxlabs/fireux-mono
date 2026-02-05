import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export type FireuxRuntimeStep = (nuxt: Nuxt) => void
export type FireuxResolverStep = (resolver: Resolver) => void
export type FireuxResolverNuxtStep = (resolver: Resolver, nuxt: Nuxt) => void
export type FireuxResolverOptionalNuxtStep = (
  resolver: Resolver,
  nuxt?: Nuxt
) => void

export interface FireuxModuleSteps {
  runtime?: FireuxRuntimeStep
  plugins?: FireuxResolverStep
  composables?: FireuxResolverStep
  components?: FireuxResolverStep
  layouts?: FireuxResolverOptionalNuxtStep
  models?: FireuxResolverStep
  pages?: FireuxResolverNuxtStep
  assets?: FireuxResolverNuxtStep
  server?: FireuxResolverStep
}

export function configureFireuxModule(
  resolver: Resolver,
  nuxt: Nuxt,
  steps: FireuxModuleSteps
) {
  steps.runtime?.(nuxt)
  steps.plugins?.(resolver)
  steps.composables?.(resolver)
  steps.components?.(resolver)
  steps.layouts?.(resolver, nuxt)
  steps.models?.(resolver)
  steps.pages?.(resolver, nuxt)
  steps.assets?.(resolver, nuxt)
  steps.server?.(resolver)
}
