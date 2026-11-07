<template>
  <UCard>
    <div>
      <h2><UIcon :name="icon" />{{ title }}</h2>
      <UButton
        v-if="to"
        :to="to"
        icon="i-lucide-arrow-up-right"
        :aria-label="`Open ${title}`"
        color="neutral"
        variant="ghost"
        size="xs"
      />
    </div>
    <p v-if="placeholder"><span />{{ description || 'Summary coming soon' }}</p>
    <FireState v-else-if="pending" outcome="pending" :entity="title" />
    <div v-else-if="error">
      <p>{{ title }} could not be loaded.</p>
      <FireCopyError :message="`${title} could not be loaded.`" />
    </div>
    <div v-else>
      <p>{{ value }}</p>
      <p v-if="description">{{ description }}</p>
      <slot />
    </div>
  </UCard>
</template>
<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  to?: string
  value?: string | number
  description?: string
  pending?: boolean
  error?: unknown
  placeholder?: boolean
}>()
</script>
