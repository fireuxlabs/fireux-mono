<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Cell.vue -->
<template>
  <UCard class="cell">
    <div class="row">
      <UAvatar
        :src="app?.avatar_url || app?.logo_url || app?.wordmark_url || ''"
        :alt="app?.app_name || app?.id || '—'"
        size="md"
        class="avatar"
      />

      <div class="main">
        <h3 class="title">{{ app?.app_name || app?.id }}</h3>
        <p class="subtitle">
          <span v-if="app?.id">{{ app.id }}</span>
          <span v-if="app?.role">• {{ app.role }}</span>
          <span v-if="app?.ecosystem">• {{ app.ecosystem }}</span>
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
defineProps<{ app?: Partial<App> | null }>()
</script>

<style scoped>
.cell {
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  transition: border-color 0.15s ease;
}

.cell:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: center;
}

.avatar {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-200, rgba(148, 163, 184, 0.45)) inset;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  font-weight: 600;
  line-height: 1.2;
}

.subtitle {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}
</style>
