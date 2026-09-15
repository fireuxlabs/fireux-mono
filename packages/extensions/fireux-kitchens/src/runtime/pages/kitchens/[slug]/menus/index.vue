<template>
  <MenuIndex :index="menuIndex">
    <template v-if="presentation" #header>
      <KitchenDetailHeader :kitchen="presentation" compact />
    </template>
  </MenuIndex>
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
const { presentation, ready: kitchenReady } = useKitchenDetail(kitchenSlug)
const { appName } = useFireUXConfig()

await Promise.all([menuIndex.ready, kitchenReady])
if (import.meta.server && menuIndex.statusCode.value) {
  setResponseStatus(menuIndex.statusCode.value)
}

useHead({ title: `${appName} | Menus` })
useSeoMeta({ description: 'Browse this kitchen’s published menus.' })
</script>
