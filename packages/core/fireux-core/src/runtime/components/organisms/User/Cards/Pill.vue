<template>
  <UCard class="pill">
    <div class="pill-inner">
      <UAvatar
        :src="user.avatar || ''"
        :alt="displayName"
        size="sm"
        :text="avatarInitials"
      />
      <span class="name">{{ displayName }}</span>
      <span v-if="user.handle" class="subtitle">@{{ user.handle }}</span>
      <UBadge v-if="user.role" size="xs" variant="subtle" class="ml-2">
        {{ user.role }}
      </UBadge>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from '../../../../models/core/user.model'

const props = defineProps<{ user: UserCard.Pill }>()

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
.pill-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.name {
  font-weight: 600;
  line-height: 1.1;
}
.subtitle {
  opacity: 0.7;
}
</style>