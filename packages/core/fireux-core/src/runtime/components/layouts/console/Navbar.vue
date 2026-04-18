<template>
  <LayoutsDashboardNavbar :title="title" :ui="ui">
    <template #right><slot name="right" /></template>
  </LayoutsDashboardNavbar>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  ui?: any
}>()
</script>
