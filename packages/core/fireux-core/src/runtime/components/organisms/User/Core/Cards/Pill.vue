<template>
  <UCard class="pill">
    <div class="pill-inline">
      <UAvatar :src="coreUser.avatar || ''" :alt="displayName" size="xs" />
      <span class="name">{{ displayName }}</span>
      <span v-if="coreUser.handle" class="subtitle"
        >@{{ coreUser.handle }}</span
      >
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CoreUser } from '../../../../../models/core/coreUser.model'

const props = defineProps<{ coreUser: CoreUser.Card.Pill }>()

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
    [
      props.coreUser?.display_name,
      props.coreUser?.handle,
      (props.coreUser as any)?.id,
    ],
    'User'
  )
)
</script>
