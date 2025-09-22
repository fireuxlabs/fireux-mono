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
          <span v-if="user.global_profiles?.length">
            Global: {{ user.global_profiles.length }}
          </span>
          <span v-if="user.app_profiles?.length">
            App: {{ user.app_profiles.length }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from '../../../../models/core/user.model'

const props = defineProps<{ user: UserCard.Cell }>()

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
  safeDisplay([props.user.display_name, props.user.handle, props.user.id], 'User')
)

const avatarInitials = computed(() => {
  const name = displayName.value.trim()
  if (!name) return 'U'
  return name.split(/\s+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 2)
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
  opacity: 0.7;
  font-size: 0.85rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>