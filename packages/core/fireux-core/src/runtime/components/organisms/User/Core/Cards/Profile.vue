<template>
  <UCard class="profile">
    <!-- Header -->
    <div class="profile-header">
      <UAvatar :src="coreUser?.avatar || ''" :alt="displayName" size="xl" />
      <div class="meta">
        <div class="name">{{ displayName }}</div>
        <div v-if="coreUser?.handle" class="subtitle">
          @{{ coreUser.handle }}
        </div>
        <div v-if="coreUser?.id" class="meta-row">
          <span class="label">ID:</span>
          <code>{{ coreUser.id }}</code>
        </div>
      </div>
    </div>

    <!-- Membership -->
    <div v-if="hasMembership" class="section">
      <div class="section-title">Membership</div>
      <div class="tags" v-if="coreUser?.userOf?.length">
        <UBadge
          v-for="app in coreUser.userOf"
          :key="app"
          variant="soft"
          size="xs"
        >
          {{ app }}
        </UBadge>
      </div>
      <div class="tags" v-if="coreUser?.adminOf?.length">
        <UBadge
          v-for="app in coreUser.adminOf"
          :key="app"
          variant="soft"
          size="xs"
          color="primary"
        >
          {{ app }}
        </UBadge>
      </div>
    </div>

    <!-- Profiles section removed: not part of slim CoreUserDoc -->

    <!-- Timestamps (Created only) -->
    <div v-if="createdText" class="section">
      <div class="section-title">Timestamps</div>
      <div class="meta-row">
        <span>Created: {{ createdText }}</span>
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
    'Core User'
  )
)

const hasMembership = computed(
  () =>
    (props.coreUser?.userOf?.length || 0) > 0 ||
    (props.coreUser?.adminOf?.length || 0) > 0
)

function fmtTs(v: any): string {
  try {
    const d = v?.toDate?.() ?? (typeof v === 'string' ? new Date(v) : v)
    return d instanceof Date && !isNaN(d.getTime())
      ? d.toLocaleDateString()
      : ''
  } catch {
    return ''
  }
}

const createdText = computed(() => fmtTs(props.coreUser?.created_at))
</script>
