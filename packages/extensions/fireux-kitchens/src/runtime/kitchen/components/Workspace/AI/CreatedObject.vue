<template>
  <NuxtLink :to="to" class="kitchen-ai-created-object">
    <UAvatar
      :src="imageUrl || undefined"
      :alt="name"
      :text="initials"
      size="sm"
    />
    <span>
      <span class="fx-truncate">
        {{ name }}
      </span>
      <span class="fx-truncate">{{ kind }}</span>
    </span>
    <span>
      {{ actionLabel || `View ${name}` }}
    </span>
    <UIcon name="i-lucide-arrow-right" />
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    kind?: string
    to: string
    imageUrl?: string
    actionLabel?: string
  }>(),
  {
    kind: 'Created object',
    imageUrl: '',
    actionLabel: '',
  }
)

const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
)
</script>

<style scoped>
.kitchen-ai-created-object {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  min-width: min(100%, 18rem);
  margin-top: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 2);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg);
  text-decoration: none;
}

.kitchen-ai-created-object:hover {
  border-color: var(--ui-primary);
}
</style>
