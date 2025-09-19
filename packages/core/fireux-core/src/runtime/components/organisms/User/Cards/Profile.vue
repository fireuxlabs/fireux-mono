<template>
  <UCard>
    <div class="profile">
      <div class="header">
        <UAvatar :src="user.avatar || ''" :alt="displayName" size="lg" />
        <div class="id-block">
          <h2 class="name">{{ displayName }}</h2>
          <div class="sub">
            <span v-if="user.handle" class="handle">@{{ user.handle }}</span>
            <UBadge v-if="user.role" size="xs" variant="subtle">{{
              user.role
            }}</UBadge>
          </div>
        </div>
      </div>

      <div class="grid">
        <div>
          <h3>Global Profiles</h3>
          <ul>
            <li v-for="p in user.global_profiles" :key="p">{{ p }}</li>
          </ul>
        </div>
        <div>
          <h3>App Profiles</h3>
          <ul>
            <li v-for="p in user.app_profiles" :key="p">{{ p }}</li>
          </ul>
        </div>
      </div>

      <div class="timestamps">
        <span v-if="user.created_at"
          >Created: {{ String(user.created_at) }}</span
        >
        <span v-if="user.updated_at"
          >Updated: {{ String(user.updated_at) }}</span
        >
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from '../../../../models/core/user.model'
const props = defineProps<{ user: UserCard.Profile }>()

function looksLikeEmail(v?: string) {
  return !!v && v.includes('@')
}
function safeDisplay(vs: Array<string | undefined>, fallback: string) {
  for (const v of vs) {
    if (!v) continue
    if (looksLikeEmail(v)) continue
    return v
  }
  return fallback
}

const displayName = computed(() =>
  safeDisplay(
    [props.user?.display_name, props.user?.handle, props.user?.id],
    'User'
  )
)
</script>

<style scoped>
.header {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.id-block .name {
  font-weight: 800;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}
.timestamps {
  opacity: 0.7;
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
</style>
