<template>
  <UPage>
    <UPageBody>
      <KitchenDetail
        v-if="presentation"
        :presentation="presentation"
        :menus="menus"
      />
      <KitchenDetailState
        v-else
        :outcome="outcome"
        :has-kitchen="Boolean(kitchen)"
        @refresh="refresh()"
      />
      <DevDebugPanel
        title="Kitchen detail acquisition"
        context="Canonical Kitchen fetched by the detail route."
        object-origin="fetched"
        :objects="{ kitchen }"
        :derived="{ routeLocator }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus } from '#imports'
import { useMenuDirectory } from '../../../menu/composables/useMenuDirectory'
import { directoryMenuRouteScope } from '../../../kitchen/utils/kitchen-menu-route'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenDetail } from '../../../kitchen/composables/useKitchenDetail'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View Kitchen details.',
})

const routeLocator = useRouteParam('slug')
const { kitchen, presentation, outcome, refresh, ready, statusCode } =
  useKitchenDetail(routeLocator)
const menus = useMenuDirectory({
  routeScope: computed(() => directoryMenuRouteScope(routeLocator.value)),
})
await Promise.all([ready, menus.ready])
if (import.meta.server && statusCode.value) setResponseStatus(statusCode.value)
</script>
