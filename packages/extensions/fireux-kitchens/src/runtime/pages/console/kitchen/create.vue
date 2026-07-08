<template>
  <UDashboardPanel id="console-kitchen-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Kitchen" />
    </template>

    <template #body>
      <section class="space-y-4">
        <KitchenCreateSystem
          v-if="canCreate"
          mode="console"
          :existing-root-id="existingRootId"
          :return-to="returnTo"
          cancel-to="/console/kitchen"
        />

        <UPageCard
          v-else
          title="Kitchen creation is not enabled here"
          description="This app uses an existing Kitchen console target."
          variant="subtle"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import KitchenCreateSystem from '../../../components/Kitchen/Create/System.vue'

const { canCreateTarget } = useConsole('kitchen')
const canCreate = computed(() => canCreateTarget())
const route = useRoute()
const existingRootId = computed(() =>
  String(route.query.existingRootId || '').trim()
)
const returnTo = computed(() =>
  existingRootId.value ? '/console/kitchen/overview' : '/console/kitchen'
)

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    requiresSelection: false,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
