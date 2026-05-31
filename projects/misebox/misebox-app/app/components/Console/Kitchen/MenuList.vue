<template>
  <AppToolFoldaway
    title="Kitchen menus"
    description="Manage this kitchen's saved menus, sections, and items."
    :open="open"
  >
    <ConsoleKitchenMenus />
  </AppToolFoldaway>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  open?: boolean
}>(), {
  open: true,
})
</script>
