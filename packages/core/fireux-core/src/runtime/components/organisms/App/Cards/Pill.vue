<template>
  <component
    :is="componentTag"
    v-bind="componentAttrs"
    :class="componentClass"
    :style="componentStyle"
    :aria-label="ariaLabel"
  >
    <UAvatar
      :src="image || undefined"
      :alt="ariaLabel"
      size="sm"
      class="fireux-pill__avatar"
    />

    <div class="fireux-pill__body">
      <div class="fireux-pill__primary">
        <span class="fireux-pill__title" :title="title">
          {{ title }}
        </span>
        <span v-if="subtitle" class="fireux-pill__subtitle" :title="subtitle">
          {{ subtitle }}
        </span>
      </div>

      <div v-if="hasBadges" class="fireux-pill__badges">
        <UBadge v-for="badge in badges" :key="badge" size="xs" variant="soft">
          {{ badge }}
        </UBadge>
      </div>
    </div>

  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const props = defineProps<{ card: AppCard.Card }>()

const sanitizeString = (input?: unknown) => {
  if (typeof input === 'string') return input.trim()
  if (input == null) return ''
  return String(input).trim()
}

const title = computed(() => sanitizeString(props.card.title))
const subtitle = computed(() => sanitizeString(props.card.subtitle))
const image = computed(() => sanitizeString(props.card.image))

const badges = computed(() => {
  const list = Array.isArray(props.card.badges) ? props.card.badges : []
  const unique = new Set<string>()

  for (const entry of list) {
    if (typeof entry !== 'string') continue
    const trimmed = entry.trim()
    if (!trimmed) continue
    unique.add(trimmed)
  }

  return Array.from(unique)
})

const hasBadges = computed(() => badges.value.length > 0)

const href = computed(() => sanitizeString(props.card.href))
const componentTag = computed(() => (href.value ? 'NuxtLink' : 'div'))
const componentAttrs = computed<Record<string, unknown>>(() =>
  href.value ? { to: href.value } : {}
)

const componentClass = computed(() => {
  const classes = [
    'fireux-pill',
    href.value ? 'fireux-pill--link' : 'fireux-pill--static',
    hasBadges.value ? 'fireux-pill--has-badges' : 'fireux-pill--compact',
  ]
  return classes
})

const componentStyle = computed(() => ({
  '--fireux-pill-min-height': hasBadges.value ? '3.8rem' : '3.4rem',
  '--fireux-pill-max-height': hasBadges.value ? 'none' : '3.6rem',
  '--fireux-pill-avatar-size': hasBadges.value ? '2.5rem' : '2.25rem',
  '--fireux-pill-padding-y': hasBadges.value ? '0.6rem' : '0.5rem',
}))

const ariaLabel = computed(() => {
  const parts = [title.value]
  if (subtitle.value) parts.push(subtitle.value)
  if (hasBadges.value) parts.push(badges.value.join(', '))
  return parts.filter(Boolean).join(' – ')
})
</script>

<style scoped>
.fireux-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: var(--fireux-pill-padding-y, 0.5rem) 0.75rem;
  border-radius: 0.5rem;
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
  color: inherit;
  text-decoration: none;
  min-height: var(--fireux-pill-min-height, 3.4rem);
  max-height: var(--fireux-pill-max-height, 3.6rem);
  overflow: hidden;
}

.fireux-pill--link {
  cursor: pointer;
}

.fireux-pill--link:focus-visible {
  outline: 2px solid var(--ui-primary-400, rgba(79, 70, 229, 0.45));
  outline-offset: 2px;
}

.fireux-pill--static {
  cursor: default;
}

.fireux-pill--has-badges {
  align-items: center;
  gap: 0.65rem;
}

.fireux-pill--compact {
  align-items: center;
}

.fireux-pill__avatar {
  width: var(--fireux-pill-avatar-size, 2.25rem);
  height: var(--fireux-pill-avatar-size, 2.25rem);
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-200, rgba(148, 163, 184, 0.45)) inset;
  flex-shrink: 0;
}

.fireux-pill__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
  justify-content: center;
}

.fireux-pill__primary {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.fireux-pill__title {
  font-weight: 600;
  line-height: 1.2;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fireux-pill__subtitle {
  font-size: 0.78rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fireux-pill__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.1rem;
}

.fireux-pill__special {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  padding: 0.3rem;
  color: var(--ui-warning-600, rgba(217, 119, 6, 1));
  background: var(--ui-warning-50, rgba(253, 224, 71, 0.18));
  margin-left: 0.5rem;
}

.fireux-pill__special-icon {
  width: 1rem;
  height: 1rem;
}
</style>
