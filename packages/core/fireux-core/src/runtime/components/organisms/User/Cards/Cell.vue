<template>
  <UCard>
    <div class="cell">
      <div class="left">
        <UAvatar :src="user.avatar || ''" :alt="displayName" size="sm" />
      </div>
      <div class="right">
        <div class="row">
          <strong class="name">{{ displayName }}</strong>
          <span v-if="user.handle" class="handle">@{{ user.handle }}</span>
          <UBadge v-if="user.role" size="xs" variant="subtle">{{
            user.role
          }}</UBadge>
        </div>
        <div class="meta">
          <span v-if="user.global_profiles?.length"
            >Global: {{ user.global_profiles.length }}</span
          >
          <span v-if="user.app_profiles?.length"
            >App: {{ user.app_profiles.length }}</span
          >
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UnifiedUser } from '../../../../../models/core/user.model'

const props = defineProps<{ user: UnifiedUser.Card.Cell }>()

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
.cell {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: center;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.name {
  font-weight: 700;
}
.handle {
  opacity: 0.7;
}
.meta {
  opacity: 0.7;
  font-size: 0.85rem;
  display: flex;
  gap: 1rem;
}
</style>
