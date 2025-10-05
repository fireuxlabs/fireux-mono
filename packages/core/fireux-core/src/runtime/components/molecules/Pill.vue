<template>
  <div class="pill flex items-center gap-3">
    <UAvatar :src="avatar" :alt="title" size="sm" />
    <div class="flex flex-col">
      <span class="font-medium">{{ title }}</span>
      <span class="text-sm text-gray-600">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  avatar: string
  title: string
  subtitle: string
}

defineProps<Props>()
</script>

<style scoped>
.pill {
  /* Additional styles if needed */
}
</style>
