<script setup lang="ts">
defineProps<{ period: any; range: { start: Date; end: Date } }>()
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-sm">Traffic</p>
    </template>
    <template #default>
      <div class="h-40 grid place-items-center text-dimmed text-sm">
        Chart placeholder
      </div>
    </template>
  </UCard>
</template>
