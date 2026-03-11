<template>
  <UDashboardPanel id="console-supplier-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Supplier Profile" />
    </template>

    <template #body>
      <section class="space-y-8">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Supplier profile</div>
              <div class="text-xs text-dimmed">
                Create your supplier profile and continue into the supplier console.
              </div>
            </div>
          </template>

          <SupplierCreateSystem
            return-to="/console/supplier/overview"
            cancel-to="/console/supplier/overview"
          />
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import SupplierCreateSystem from '../../../components/console/supplier/Create/System.vue'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})
</script>
