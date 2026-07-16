<template>
  <MenuIndex
    :menu-route-scope="menuRouteScope"
    propagate-response-status
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useSeoMeta } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { directoryMenuRouteScope } from '../../../../utils/kitchen-menu-route'

definePageMeta({
  name: 'KitchenMenusIndexPage',
  title: 'Menus',
  description: 'Browse this kitchen’s published menus.',
})

const kitchenSlug = useRouteParam('slug')
const menuRouteScope = computed(() =>
  directoryMenuRouteScope(kitchenSlug.value)
)
const { appName } = useFireUXConfig()

useHead({ title: `${appName} | Menus` })
useSeoMeta({ description: 'Browse this kitchen’s published menus.' })
</script>
