<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <USlideover v-model:open="open" title="Notifications">
    <template #body>
      <div class="text-sm text-dimmed">No notifications.</div>
    </template>
  </USlideover>
</template>
