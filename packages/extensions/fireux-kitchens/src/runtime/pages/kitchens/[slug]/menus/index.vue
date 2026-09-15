<template>
  <MenuIndex :index="menuIndex" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useHead, useSeoMeta } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { directoryMenuRouteScope } from '../../../../kitchen/utils/kitchen-menu-route'
import { useMenuDirectory } from '../../../../menu/composables/useMenuDirectory'

definePageMeta({
  name: 'KitchenMenusIndexPage',
  layout: 'default',
  title: 'Menus',
  description: 'Browse this kitchen’s published menus.',
})

const kitchenSlug = useRouteParam('slug')
const menuRouteScope = computed(() =>
  directoryMenuRouteScope(kitchenSlug.value)
)
const menuIndex = useMenuDirectory({ routeScope: menuRouteScope })
const { appName } = useFireUXConfig()

await menuIndex.ready
if (import.meta.server && menuIndex.statusCode.value) {
  setResponseStatus(menuIndex.statusCode.value)
}

useHead({ title: `${appName} | Menus` })
useSeoMeta({ description: 'Browse this kitchen’s published menus.' })
</script>
