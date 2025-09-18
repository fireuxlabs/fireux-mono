<template>
  <UCard class="pill">
    <div class="pill-inline">
      <UAvatar :src="user.avatar || ''" :alt="displayName" size="xs" />
      <span class="name">{{ displayName }}</span>
      <span v-if="user.handle" class="subtitle">@{{ user.handle }}</span>
      <UBadge v-if="user.role" size="xs" variant="subtle" class="ml-2">{{
        user.role
      }}</UBadge>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UnifiedUser } from '../../../../../models/core/user.model'

const props = defineProps<{ user: UnifiedUser.Card.Pill }>()

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
.pill-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.name {
  font-weight: 600;
}
.subtitle {
  opacity: 0.7;
}
</style>
