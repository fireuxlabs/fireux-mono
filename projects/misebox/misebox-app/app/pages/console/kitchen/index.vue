<template>
  <UDashboardPanel id="misebox-console-kitchen-entry">
    <template #header>
      <LayoutsConsoleNavbar title="Misebox Kitchen Console" />
    </template>

    <template #body>
      <section class="space-y-4">
        <p class="text-sm text-dimmed">
          Choose a live kitchen, open a read-only scenario, or jump into a test kitchen.
        </p>

        <KitchenCTA />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import KitchenCTA from 'fireux-kitchens/runtime/components/organisms/Kitchen/CTA.vue'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})
</script>
