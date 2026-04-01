<template>
  <div class="flex w-full flex-col gap-2">
    <UButton to="/" icon="i-lucide-house" color="neutral" variant="ghost" block>
      Home
    </UButton>
    <UButton to="/dashboard" icon="i-lucide-layout-dashboard" color="neutral" variant="ghost" block>
      Dashboard
    </UButton>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  collapsed: boolean
  compactProfile?: boolean
}>()
</script>
