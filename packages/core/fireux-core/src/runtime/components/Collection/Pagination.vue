<template>
  <div v-if="hasMore" class="flex justify-center">
    <UButton
      label="Load more"
      variant="soft"
      color="neutral"
      :loading="loading"
      :disabled="loading"
      @click="$emit('load-more')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hasMore: boolean
  loading?: boolean
}>()

defineEmits<{
  'load-more': []
}>()
</script>
