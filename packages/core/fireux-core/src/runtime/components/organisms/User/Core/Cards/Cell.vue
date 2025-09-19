<template>
  <UCard class="cell">
    <div class="cell-inner">
      <UAvatar :src="coreUser.avatar || ''" :alt="displayName" size="md" />
      <div class="meta">
        <div class="name">{{ displayName }}</div>
        <div v-if="coreUser.handle" class="subtitle">
          @{{ coreUser.handle }}
        </div>

        <!-- Apps only (no admin section) -->
        <div v-if="coreUser.userOf?.length" class="cell-badges">
          <UBadge
            v-for="app in coreUser.userOf"
            :key="app"
            size="xs"
            variant="soft"
          >
            {{ app }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CoreUserDoc } from '../../../../../models/core/user.model'

const props = defineProps<{ coreUser: CoreUserDoc & { id?: string } }>()

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
    [props.coreUser?.display_name, props.coreUser?.handle, props.coreUser?.id],
    'User'
  )
)
</script>
