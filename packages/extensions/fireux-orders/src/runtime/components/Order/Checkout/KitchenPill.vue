<template>
  <div v-if="kitchenId" class="flex flex-wrap items-center gap-2">
    <UBadge variant="soft" color="neutral">Kitchen</UBadge>
    <UBadge variant="soft">{{ label }}</UBadge>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kitchenId: string
  label: string
}>()
</script>
