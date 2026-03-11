<template>
  <UDashboardPanel id="console-kitchen-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Kitchen" />
    </template>

    <template #body>
      <section class="space-y-8">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Kitchen details</div>
              <div class="text-xs text-dimmed">
                Select a real location to manage in the kitchen console.
              </div>
            </div>
          </template>

          <KitchenCreateSystem />
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import KitchenCreateSystem from '../../../components/organisms/Kitchen/Create/System.vue'

definePageMeta({
  layout: 'kitchen-console',
  requiresAuth: true,
})
</script>
