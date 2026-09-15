<template>
  <UPage>
    <UPageBody>
      <article v-if="presentation" class="space-y-8">
        <KitchenDetailHeader :kitchen="presentation" />
        <KitchenDetailMenus :kitchen="presentation" :index="menuIndex" />
      </article>
      <KitchenDetailState
        v-else
        :outcome="outcome"
        :has-kitchen="Boolean(kitchen)"
        @refresh="refresh()"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useHead, useSeoMeta } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { directoryMenuRouteScope } from '../../../../kitchen/utils/kitchen-menu-route'
import { useKitchenDetail } from '../../../../kitchen/composables/useKitchenDetail'
import { useMenuDirectory } from '../../../../menu/composables/useMenuDirectory'

definePageMeta({
  name: 'KitchenMenusIndexPage',
  title: 'Menus',
  description: 'Browse this kitchen’s published menus.',
})

const kitchenSlug = useRouteParam('slug')
const menuRouteScope = computed(() =>
  directoryMenuRouteScope(kitchenSlug.value)
)
const menuIndex = useMenuDirectory({ routeScope: menuRouteScope })
const {
  kitchen,
  presentation,
  outcome,
  refresh,
  statusCode,
  ready: kitchenReady,
} = useKitchenDetail(kitchenSlug)
const { appName } = useFireUXConfig()

await Promise.all([menuIndex.ready, kitchenReady])
if (import.meta.server && (statusCode.value || menuIndex.statusCode.value)) {
  setResponseStatus(statusCode.value || menuIndex.statusCode.value || 500)
}

useHead({
  title: () => `${presentation.value?.display_name || appName} | Menus`,
})
useSeoMeta({
  description: 'Browse this kitchen’s published menus.',
  robots: () =>
    statusCode.value || menuIndex.error.value ? 'noindex, nofollow' : undefined,
})
</script>
