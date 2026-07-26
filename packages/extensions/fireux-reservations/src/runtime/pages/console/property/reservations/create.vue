<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-property-reservations-create">
      <template #header>
        <LayoutsConsoleNavbar title="Add booking">
          <template #right>
            <UButton
              to="/console/property/reservations"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
            >
              Close
            </UButton>
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="panels-narrow space-y-5">
          <ConsolePropertyOperationsReservationsCreate />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  consoleSurface: 'create',
  visibility: { modules: ['fireux-reservations'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
