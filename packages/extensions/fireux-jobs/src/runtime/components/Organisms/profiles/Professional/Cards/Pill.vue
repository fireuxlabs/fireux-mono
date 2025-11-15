<template>
  <component
    :is="wrapperTag"
    v-bind="wrapperBindings"
    :class="rootClass"
    :aria-label="ariaLabel"
  >
    <UAvatar
      :src="normalized.avatar"
      :alt="normalized.title"
      size="sm"
      class="avatar"
    />

    <div class="content">
      <span class="title" :title="normalized.title">
        {{ normalized.title }}
      </span>

      <span
        v-if="normalized.subtitle"
        class="subtitle"
        :title="normalized.subtitle"
      >
        {{ normalized.subtitle }}
      </span>

      <div v-if="normalized.badges.length" class="badges">
        <UBadge
          v-for="badge in normalized.badges"
          :key="badge"
          color="primary"
          variant="soft"
          size="xs"
          :title="badge"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model.ts'

const props = defineProps<{ professional?: ProfessionalCard.Pill | null }>()

const normalized = computed(() => {
  const base = props.professional ?? ({} as ProfessionalCard.Pill)
  const badges = Array.isArray(base.badges)
    ? (base.badges.filter(Boolean) as string[])
    : []

  return {
    avatar: base.avatar ?? '',
    title: base.title ?? 'Professional',
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

const ariaLabel = computed(() => normalized.value.title || 'professional pill')

const rootClass = computed(() => [
  'pill flex items-center gap-3 rounded-xl px-3 py-2 shadow-sm',
  hasLink.value
    ? 'cursor-pointer no-underline text-inherit focus:outline-none focus:ring-2 focus:ring-offset-2'
    : 'cursor-default',
])
</script>

<style scoped>
.pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  text-decoration: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pill:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.avatar {
  flex-shrink: 0;
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-200, rgba(148, 163, 184, 0.45)) inset;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.title {
  font-weight: 600;
  line-height: 1.2;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
</style>
