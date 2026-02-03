<template>
  <UPageCard :title="title" :description="description" variant="subtle">
    <UButton
      :label="buttonLabel"
      color="neutral"
      :loading="loading"
      @click="emit('create')"
    />

    <p v-if="error" class="mt-3 text-sm text-dimmed">
      {{ error }}
    </p>
  </UPageCard>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  buttonLabel: string
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'create'): void
}>()
</script>
