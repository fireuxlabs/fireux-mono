import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { getReservedRootRouteKeys } from './reserved-route-keys'

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
  pages?: FireuxResolverNuxtStep
  assets?: FireuxResolverNuxtStep
  server?: FireuxResolverOptionalNuxtStep
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
  steps.pages?.(resolver, nuxt)
  steps.assets?.(resolver, nuxt)
  steps.server?.(resolver, nuxt)

  const runtimeConfig = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (runtimeConfig.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>
  fireux.reservedRouteKeys = getReservedRootRouteKeys()
}
