<template>
  <UPageCard
    :title="title"
    :description="description || undefined"
    :to="to || undefined"
  >
    <template v-if="image" #leading>
      <UAvatar :src="image" :alt="title" size="lg" />
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    image?: string
    to?: string
  }>(),
  {
    description: '',
    image: '',
    to: '',
  }
)
</script>
