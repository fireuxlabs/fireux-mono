<template>
  <UPage>
    <UPageBody>
      <MenuDetail v-if="menu" :menu="menu" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useMenuDetail } from '../../../menu/composables/useMenuDetail'

definePageMeta({
  layout: false,
  title: 'Menu',
  description: 'View Menu details.',
  middleware: ['menu-tenant-route', 'menu-projection-layout'],
  menuProjection: true,
})

const routeMenuId = useRouteParam('menuId')
const { menu, ready } = useMenuDetail(routeMenuId)
await ready
</script>
