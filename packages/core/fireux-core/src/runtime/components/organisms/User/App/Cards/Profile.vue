<template>
  <UCard class="profile">
    <!-- Header -->
    <div class="profile-header">
      <UAvatar :src="appUser?.avatar || ''" :alt="displayName" size="xl" />
      <div class="meta">
        <div class="name">{{ displayName }}</div>
        <div class="tags">
          <UBadge
            v-if="appUser?.role"
            variant="soft"
            size="xs"
            :color="appUser.role === 'admin' ? 'primary' : 'neutral'"
          >
            {{ appUser.role }}
          </UBadge>
          <UBadge v-if="appUser?.profiles?.length" variant="soft" size="xs">
            {{ appUser.profiles.length }} profile{{
              appUser.profiles.length !== 1 ? 's' : ''
            }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Enabled profiles -->
    <div v-if="appUser?.profiles?.length" class="section">
      <div class="section-title">Enabled Profiles</div>
      <div class="tags">
        <UBadge v-for="p in appUser.profiles" :key="p" variant="soft" size="xs">
          {{ p }}
        </UBadge>
      </div>
    </div>

    <!-- Timestamps (Joined only) -->
    <div v-if="createdText" class="section">
      <div class="section-title">Timestamps</div>
      <div class="meta-row">
        <span>Joined: {{ createdText }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AppUserLike = {
  id?: string
  display_name?: string
  avatar?: string
  handle?: string
  role?: 'user' | 'admin'
  profiles?: string[]
  created_at?: any
}

const props = defineProps<{ appUser: AppUserLike }>()

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
    [props.appUser?.display_name, props.appUser?.handle, props.appUser?.id],
    'User'
  )
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

const createdText = computed(() => fmtTs(props.appUser?.created_at))
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.name {
  font-size: 1.25rem;
  font-weight: 600;
}
.tags {
  display: flex;
  gap: 0.5rem;
}
.section {
  margin-top: 1rem;
}
.section-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.meta-row {
  display: flex;
  justify-content: space-between;
}
</style>
