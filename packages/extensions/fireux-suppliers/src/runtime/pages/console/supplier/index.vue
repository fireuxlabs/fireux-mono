<template>
  <UDashboardPanel id="console-supplier-entry">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Console" />
    </template>

    <template #body>
      <section class="space-y-4">
        <p class="text-sm text-dimmed">
          Choose your live supplier console or open a read-only supplier scenario.
        </p>

        <SupplierEntry />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import SupplierEntry from '../../../components/console/supplier/Entry.vue'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})
</script>
