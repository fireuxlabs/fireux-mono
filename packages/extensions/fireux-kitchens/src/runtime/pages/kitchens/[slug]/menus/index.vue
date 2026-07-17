<template>
  <MenuIndex
    :index="menuIndex"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useHead, useSeoMeta } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { directoryMenuRouteScope } from '../../../../utils/kitchen-menu-route'
import { usePublicMenuIndex } from '../../../../composables/fireux/menu/usePublicMenuIndex'

definePageMeta({
  name: 'KitchenMenusIndexPage',
  title: 'Menus',
  description: 'Browse this kitchen’s published menus.',
})

const kitchenSlug = useRouteParam('slug')
const menuRouteScope = computed(() =>
  directoryMenuRouteScope(kitchenSlug.value)
)
const menuIndex = usePublicMenuIndex({ routeScope: menuRouteScope })
const { appName } = useFireUXConfig()

await menuIndex.ready
if (import.meta.server && menuIndex.statusCode.value) {
  setResponseStatus(menuIndex.statusCode.value)
}

useHead({ title: `${appName} | Menus` })
useSeoMeta({ description: 'Browse this kitchen’s published menus.' })
</script>
