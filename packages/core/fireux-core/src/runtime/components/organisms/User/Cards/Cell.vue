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
    (entry): entry is string => Boolean(entry)
  )
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
.profiles {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  list-style: none;
}
.profile-badge {
  text-transform: none;
  border-width: 1px;
  border-style: solid;
  font-weight: 500;
  letter-spacing: 0.01em;
}
</style>
