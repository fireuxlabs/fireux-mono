<!-- FILE: packages/core/fireux-core/src/runtime/components/molecules/Pill.vue -->
<template>
  <div class="pill flex items-center gap-3 rounded-xl px-3 py-2 shadow-sm">
    <UAvatar :src="avatar" :alt="title || '—'" size="sm" class="avatar" />
    <div class="flex flex-col leading-tight">
      <span class="title">
        {{ title || 'Untitled' }}
      </span>
      <span class="subtitle">
        {{ subtitle || '—' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  avatar?: string
  title?: string
  subtitle?: string
}
defineProps<Props>()
</script>

<style scoped>
.pill {
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  transition: border-color 0.15s ease;
}

.pill:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.title {
  font-weight: 600;
}

.subtitle {
  font-size: 0.75rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}

.avatar {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-200, rgba(148, 163, 184, 0.45)) inset;
}
</style>
