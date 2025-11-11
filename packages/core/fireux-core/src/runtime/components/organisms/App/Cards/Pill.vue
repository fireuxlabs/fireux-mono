<template>
  <component :is="wrapperTag" v-bind="wrapperBindings" class="block">
    <UCard class="pill">
      <div class="pill-content">
        <UAvatar
          :src="normalized.avatar || undefined"
          :alt="normalized.title || 'App'"
          :text="normalized.initials || 'A'"
          size="md"
          class="pill-avatar"
        />

        <div class="pill-main">
          <h3 class="pill-title">{{ normalized.title || 'App' }}</h3>
          <p v-if="normalized.subtitle" class="pill-subtitle">
            {{ normalized.subtitle }}
          </p>

          <div v-if="normalized.badges.length" class="pill-meta">
            <UBadge
              v-for="badge in normalized.badges"
              :key="badge"
              color="primary"
              variant="soft"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { AppCard } from 'fireux-core/runtime/models/core/app.model.ts'

const props = defineProps<{ app?: AppCard.Pill | null }>()

const normalized = computed(() => {
  const base = props.app ?? ({} as AppCard.Pill)
  const badges = Array.isArray(base.badges)
    ? (base.badges.filter(Boolean) as string[])
    : []

  return {
    avatar: base.avatar ?? '',
    initials: base.initials ?? 'A',
    title: base.title ?? '',
    subtitle: base.subtitle ?? '',
    badges,
    to: base.to ?? null,
  }
})

const hasLink = computed(() => Boolean(normalized.value.to))

const wrapperTag = computed(() => (hasLink.value ? 'NuxtLink' : 'div'))

const wrapperBindings = computed(() => {
  if (!hasLink.value) return {}
  return { to: normalized.value.to as RouteLocationRaw }
})
</script>

<style scoped>
.pill {
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
}

.pill-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: center;
}

.pill-avatar {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-200, rgba(148, 163, 184, 0.35)) inset;
}

.pill-main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.pill-title {
  font-weight: 600;
  line-height: 1.2;
}

.pill-subtitle {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}

.pill-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
</style>
