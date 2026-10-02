import type { Resolver } from '@nuxt/kit'
import { filterPagesByGlob } from 'fireux-core/config/module/pages-config'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import type { Nuxt } from '@nuxt/schema'

export type FireuxJobsPageCapabilities = {
  jobs: boolean
  agents: boolean
  professionals: boolean
}

export function configurePages(
  resolver: Resolver,
  nuxt: Nuxt,
  capabilities: FireuxJobsPageCapabilities
) {
  const runtimeDir = requireNativeRuntimeLayer(resolver, nuxt)
  if (!runtimeDir) return

  const excluded: string[] = []
  if (!capabilities.jobs) {
    excluded.push(
      `${runtimeDir}/pages/jobs/**`,
      `${runtimeDir}/pages/dashboard/admin/jobs.vue`,
      `${runtimeDir}/pages/dashboard/agent/my-gigs.vue`,
      `${runtimeDir}/pages/dashboard/professional/my-jobs.vue`
    )
  }
  if (!capabilities.agents) {
    excluded.push(
      `${runtimeDir}/pages/agents/**`,
      `${runtimeDir}/pages/dashboard/admin/agents.vue`,
      `${runtimeDir}/pages/dashboard/agent/**`
    )
  }
  if (!capabilities.professionals) {
    excluded.push(
      `${runtimeDir}/pages/professionals/**`,
      `${runtimeDir}/pages/dashboard/admin/professionals.vue`,
      `${runtimeDir}/pages/dashboard/professional/**`
    )
  }

  if (excluded.length) filterPagesByGlob(nuxt, excluded)
}
