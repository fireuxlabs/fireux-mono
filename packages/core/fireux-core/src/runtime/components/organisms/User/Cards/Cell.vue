<template>
  <UCard class="cell">
    <div class="cell-inner">
      <UAvatar
        :src="user.avatar || ''"
        :alt="displayName"
        size="md"
        :text="avatarInitials"
      />
      <div class="meta">
        <div class="row">
          <strong class="name">{{ displayName }}</strong>
          <span v-if="user.handle" class="handle">@{{ user.handle }}</span>
          <UBadge v-if="user.role" size="xs" variant="subtle">
            {{ user.role }}
          </UBadge>
        </div>

        <div class="subrow">
          <span v-if="email" class="pill">{{ email }}</span>
          <span v-if="profilesLabel" class="pill">{{ profilesLabel }}</span>
          <span v-if="memberLabel" class="pill">{{ memberLabel }}</span>
          <span v-if="adminLabel" class="pill">{{ adminLabel }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from '../../../../models/core/user.model'

const props = defineProps<{
  user: UserCard.Cell & {
    email?: string | null
    profiles?: string[] | null
    userOf?: string[] | null
    adminOf?: string[] | null
  }
}>()

const looksLikeEmail = (v?: string) => !!v && v.includes('@')
const safeDisplay = (vs: Array<string | undefined>, fallback: string) => {
  for (const v of vs) {
    if (!v) continue
    if (looksLikeEmail(v)) continue
    const t = v.trim()
    if (t) return t
  }
  return fallback
}

const displayName = computed(() =>
  safeDisplay(
    [props.user.display_name, props.user.handle, props.user.id],
    'User'
  )
)

const email = computed(() => props.user.email ?? '')

const profilesLabel = computed(() => {
  const profiles = Array.isArray(props.user.profiles)
    ? props.user.profiles.filter(Boolean)
    : []
  if (!profiles.length) return ''
  if (profiles.length <= 3) return `Profiles: ${profiles.join(', ')}`
  return `Profiles: ${profiles.length}`
})

const memberLabel = computed(() => {
  const userOf = Array.isArray(props.user.userOf)
    ? props.user.userOf.filter(Boolean)
    : []
  if (!userOf.length) return ''
  if (userOf.length === 1) return `Member of ${userOf[0]}`
  return `Member of ${userOf.length} apps`
})

const adminLabel = computed(() => {
  const adminOf = Array.isArray(props.user.adminOf)
    ? props.user.adminOf.filter(Boolean)
    : []
  if (!adminOf.length) return ''
  if (adminOf.length === 1) return `Admin of ${adminOf[0]}`
  return `Admin of ${adminOf.length} apps`
})

const avatarInitials = computed(() => {
  const name = displayName.value.trim()
  if (!name) return 'U'
  return name
    .split(/\s+/)
    .map((w) => w[0] || '')
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
  opacity: 0.75;
}
.subrow {
  margin-top: 0.25rem;
  opacity: 0.8;
  font-size: 0.85rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.15);
  padding: 0.15rem 0.6rem;
  line-height: 1.1;
}
</style>
