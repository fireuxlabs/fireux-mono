<template>
  <UDashboardPanel id="console-blank-home">
    <template #header>
      <LayoutsConsoleNavbar title="Blank">
        <template #right>
          <UButton
            to="/console/blank/create"
            icon="i-lucide-plus"
            color="primary"
          >
            Create Blank
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <ConsoleBlank />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  name: 'BlankConsoleIndexPage',
  nav: {
    key: 'console-blank',
    label: 'Blank',
    icon: 'i-lucide-square-dashed',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
})
</script>
