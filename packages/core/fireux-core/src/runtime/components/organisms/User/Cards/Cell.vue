<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/user/Organisms/User/Cards/Cell.vue -->
<template>
  <component :is="wrapperTag" v-bind="wrapperBindings" :class="wrapperClass">
    <UCard class="cell">
      <div class="cell-inner">
        <UAvatar
          :src="user.avatar"
          :alt="user.display_name"
          size="md"
          :text="initials"
        />

        <div class="meta">
          <div class="row">
            <strong class="name">{{ user.display_name }}</strong>
            <span v-if="user.handle" class="handle">@{{ user.handle }}</span>
            <UBadge v-if="user.role" size="xs" variant="subtle">{{
              user.role
            }}</UBadge>
          </div>

          <div v-if="profileBadges.length" class="subrow">
            <ul class="profiles" aria-label="Profile memberships">
              <li v-for="badge in profileBadges" :key="badge">
                <UBadge
                  size="xs"
                  variant="soft"
                  class="profile-badge"
                  :style="profileBadgeStyle"
                >
                  {{ badge }}
                </UBadge>
              </li>
            </ul>
          </div>

          <div v-if="hasContextSummary" class="subrow context">
            <span v-if="adminSummary" class="context-chip">
              Admin of {{ adminSummary }}
            </span>
            <span v-if="memberSummary" class="context-chip">
              User of {{ memberSummary }}
            </span>
          </div>
        </div>
      </div>
    </UCard>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

const props = defineProps<{
  user: User
  to?: RouteLocationRaw | null
}>()

const fireux = useFireUXConfig()

const wrapperTag = computed(() => (props.to ? 'NuxtLink' : 'div'))
const wrapperBindings = computed(() => (props.to ? { to: props.to } : {}))
const wrapperClass = computed(() =>
  props.to ? 'block no-underline text-inherit' : undefined
)

const profileBadges = computed(() =>
  Array.from(new Set(props.user.profiles ?? [])).filter(
    (entry): entry is string => typeof entry === 'string' && entry.length > 0
  )
)

const adminMemberships = computed(() =>
  Array.from(new Set((props.user as any).adminOf ?? [])).filter(
    (entry): entry is string => typeof entry === 'string' && entry.length > 0
  )
)

const memberMemberships = computed(() =>
  Array.from(new Set((props.user as any).userOf ?? [])).filter(
    (entry): entry is string => typeof entry === 'string' && entry.length > 0
  )
)

const summarizeMemberships = (values: string[]): string => {
  if (!values.length) return ''
  if (values.length === 1) return values[0]
  if (values.length === 2) return `${values[0]}, ${values[1]}`
  return `${values[0]}, +${values.length - 1} more`
}

const adminSummary = computed(() =>
  summarizeMemberships(adminMemberships.value)
)
const memberSummary = computed(() =>
  summarizeMemberships(memberMemberships.value)
)
const hasContextSummary = computed(() =>
  Boolean(adminSummary.value || memberSummary.value)
)

const sanitizeColor = (value?: string | null): string | undefined => {
  if (!value) return undefined
  const trimmed = String(value).replace(/['"]/g, '').trim()
  return trimmed || undefined
}

const toHex = (value?: string | null): string | undefined => {
  const sanitized = sanitizeColor(value)
  if (!sanitized) return undefined
  const hex = sanitized.startsWith('#') ? sanitized.slice(1) : sanitized
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex.toUpperCase()}`
  }
  return undefined
}

const hexToRgba = (hex: string, alpha: number): string | undefined => {
  const raw = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return undefined
  const bigint = parseInt(raw, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const badgeHex = computed(
  () => toHex(fireux.secondaryColor) ?? toHex(fireux.primaryColor) ?? '#3B82F6'
)

const badgeColor = computed(
  () =>
    sanitizeColor(fireux.secondaryColor) ??
    sanitizeColor(fireux.primaryColor) ??
    badgeHex.value
)

const profileBadgeStyle = computed(() => {
  const hex = badgeHex.value
  const background = hexToRgba(hex, 0.16)
  const border = hexToRgba(hex, 0.32)
  const text = hexToRgba(hex, 0.85)
  return {
    backgroundColor: background ?? badgeColor.value,
    borderColor: border ?? hex,
    color: text ?? hex,
  }
})

const initials = computed(() => {
  const name = props.user.display_name?.trim() ?? ''
  if (!name) return 'U'
  return name
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>

<style scoped>
.cell {
  /* Prevent the compact cell from stretching to match taller siblings */
  align-self: flex-start;
  max-height: var(--fireux-user-cell-max-height, 12.5rem);
  overflow: hidden;
}
.cell-inner {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.meta {
  flex: 1;
  min-width: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.name {
  font-weight: 700;
}
.handle {
  opacity: 0.7;
}
.subrow {
  margin-top: 0.25rem;
  font-size: 0.85rem;
}
.context {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.context-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  background: var(--ui-background-100, rgba(148, 163, 184, 0.12));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.28));
  line-height: calc(var(--fireux-user-pill-height, 1.75rem) - 0.4rem);
  color: var(--ui-text-500, rgba(100, 116, 139, 0.95));
  height: var(--fireux-user-pill-height, 1.75rem);
  max-height: var(--fireux-user-pill-height, 1.75rem);
  white-space: nowrap;
  overflow: hidden;
  align-self: flex-start;
}
.profiles {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  list-style: none;
}
.profile-badge {
  display: inline-flex;
  align-items: center;
  text-transform: none;
  border-width: 1px;
  border-style: solid;
  font-weight: 500;
  letter-spacing: 0.01em;
  height: var(--fireux-user-pill-height, 1.75rem);
  max-height: var(--fireux-user-pill-height, 1.75rem);
  overflow: hidden;
  white-space: nowrap;
}
</style>
