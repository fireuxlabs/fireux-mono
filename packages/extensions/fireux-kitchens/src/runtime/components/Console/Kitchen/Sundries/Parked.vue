<template>
  <UDashboardPanel :id="panelId">
    <template #header>
      <LayoutsConsoleNavbar :title="title" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          :title="alertTitle"
          :description="description"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
// Console sundries quarantine: docs/concepts/console.md
defineProps<{
  panelId: string
  title: string
  alertTitle: string
  description: string
}>()
</script>
