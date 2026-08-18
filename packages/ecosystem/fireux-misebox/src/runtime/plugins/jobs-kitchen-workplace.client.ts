// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: keep Kitchen materialization as a Professional Experience adapter only.
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useKitchenCreate } from 'fireux-kitchens/runtime/kitchen/composables/firestore/mutations/useKitchenCreate'
import type { JobWorkplaceMaterializationContext } from 'fireux-jobs/runtime/composables/workplace/materializeWorkplace'
import type { NuxtApp } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const fireuxConfig = (useRuntimeConfig().public as any)?.fireux
  const modules = new Set(
    Array.isArray(fireuxConfig?.modules)
      ? fireuxConfig.modules.map((value: unknown) => String(value ?? '').trim())
      : []
  )
  if (!modules.has('fireux-jobs') || !modules.has('fireux-kitchens')) return

  const jobsConfig = fireuxConfig?.jobs
  const workplaceTypes = Array.isArray(jobsConfig?.workplaces)
    ? jobsConfig.workplaces.map((value: unknown) => String(value ?? '').trim())
    : []
  const workplaceCollections = Array.isArray(jobsConfig?.placeCollections)
    ? jobsConfig.placeCollections.map((value: unknown) =>
        String(value ?? '').trim()
      )
    : []
  if (
    jobsConfig?.enabled !== true ||
    (!workplaceTypes.includes('kitchen') &&
      !workplaceCollections.includes('kitchens'))
  ) {
    return
  }

  const { createKitchenConsole } = useKitchenCreate()

  nuxtApp.hook(
    'fireux:jobs:workplace:materialize' as any,
    (async (context: JobWorkplaceMaterializationContext) => {
      if (
        context.workplaceType !== 'kitchen' &&
        context.workplaceCollection !== 'kitchens'
      ) {
        return
      }

      await context.materialize('fireux-misebox:fireux-kitchens', async () => {
        const result = await createKitchenConsole({
          id: context.workplaceId,
          place_id: context.workplaceId,
          place: {
            ...context.place,
            id: context.workplaceId,
          },
        })

        if (result.id !== context.workplaceId) {
          throw new Error('Kitchen materialization returned a different id')
        }
      })
    }) as any
  )
})
