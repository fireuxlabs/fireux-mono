<template>
  <LayoutsDashboardNavbar :title="title" :ui="ui" :show-subscription="false">
    <template #right>
      <div class="flex items-center gap-2">
        <UserPingControl />
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
}>()
</script>
