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
          return-to="/console/kitchen"
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
import { computed } from 'vue'
import { useConsoleConfig } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleConfig'
import KitchenCreateSystem from '../../../components/Kitchen/Create/System.vue'

const { canCreateTarget } = useConsoleConfig('kitchen')
const canCreate = computed(() => canCreateTarget())

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
