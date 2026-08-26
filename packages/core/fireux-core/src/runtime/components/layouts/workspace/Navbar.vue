<template>
  <LayoutsDashboardNavbar
    :title="title"
    :ui="ui"
    :show-title="showTitle"
    :show-subscription="false"
  >
    <template #right>
      <div class="flex items-center gap-2">
        <UserSubscriptionControl />
        <slot name="right" />
      </div>
    </template>
  </LayoutsDashboardNavbar>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  ui?: any
  showTitle?: boolean
}>()
</script>
