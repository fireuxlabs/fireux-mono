<template>
  <component
    :is="componentTag"
    v-bind="componentAttrs"
    :class="componentClass"
    :aria-label="ariaLabel"
  >
    <UAvatar
      :src="image || undefined"
      :alt="ariaLabel"
      size="sm"
      class="avatar"
    />

    <div class="content">
      <span class="title" :title="title">
        {{ title || 'User' }}
      </span>

      <span v-if="subtitle" class="subtitle" :title="subtitle">
        {{ subtitle }}
      </span>

      <div v-if="hasBadges" class="badges">
        <UBadge v-for="badge in badges" :key="badge" size="xs" variant="soft">
          {{ badge }}
        </UBadge>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from '../../../../models/core/user.model'

const props = defineProps<{ card: UserCard.Card }>()

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

const componentClass = computed(() => [
  'pill flex items-center gap-3 rounded-xl px-3 py-2 shadow-sm',
  href.value
    ? 'cursor-pointer no-underline text-inherit focus:outline-none focus:ring-2 focus:ring-offset-2'
    : 'cursor-default',
])

const ariaLabel = computed(() => {
  const parts = [title.value]
  if (subtitle.value) parts.push(subtitle.value)
  if (hasBadges.value) parts.push(badges.value.join(', '))
  return parts.filter(Boolean).join(' – ') || 'User'
})
</script>

<style scoped>
.pill {
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  display: flex;
  width: 100%;
  text-align: left;
}

.pill:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.avatar {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-200, rgba(148, 163, 184, 0.45)) inset;
}

.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.2rem;
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
  font-size: 0.75rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.2rem;
}
</style>
