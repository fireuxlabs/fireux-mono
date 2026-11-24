<template>
  <UDashboardGroup unit="rem" :persistent="false">
    <UDashboardSidebar
      :default-size="14"
      :toggle="false"
      aria-hidden="true"
    />

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="title" :toggle="false" />
      </template>

      <template #body>
        <main>
          <slot />
        </main>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>
