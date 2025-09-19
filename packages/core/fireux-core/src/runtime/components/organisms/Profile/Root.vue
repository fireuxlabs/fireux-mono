<template>
  <div class="profile-page space-y-4">
    <!-- Optional toolbar -->
    <div v-if="$slots.toolbar">
      <slot
        name="toolbar"
        :is-tenant="Boolean(profile.collection?.local)"
        :has-local="Boolean(profile.collection?.local)"
        :has-global="Boolean(profile.collection?.global?.value)"
        :showing="showing"
        :show-local="showLocal"
        :show-global="showGlobal"
        :fetch-global="fetchGlobal"
      />
    </div>

    <!-- Current profile (global source of truth) -->
    <template v-if="showCurrent && currentProfile">
      <slot
        name="profile-pill"
        :profile="currentProfile"
        :navigate="navigate"
      />
      <slot
        name="profile-card"
        :profile="currentProfile"
        :navigate="navigate"
      />
    </template>

    <!-- List -->
    <template v-if="list.length">
      <template v-for="p in list" :key="p.id || p.uid">
        <slot name="profile-item" :profile="p" :navigate="navigate" />
      </template>
    </template>
    <p v-else class="opacity-70">No profiles yet.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfile } from '../../../composables/firestore/profiles/useProfile'
import type { ProfileConfig } from '../../../models/profiles/profile.model'

const props = defineProps<{
  config: ProfileConfig
  showCurrent?: boolean
  /** Optional override for navigation base (defaults to '/<collectionName>') */
  basePath?: string
}>()

const showCurrent = computed(() => props.showCurrent ?? true)

/** Keep as an object (don’t destructure) so optional chaining stays safe */
const profile = useProfile(props.config)

/** Canonical current (global value from composable's profile) */
const currentProfile = computed(() => profile.profile?.value?.core || null)

/** Signals */
const hasLocal = computed(() => Boolean(profile.collection?.local))
const hasGlobalLoaded = computed(() =>
  Boolean(profile.collection?.global?.value)
)

/**
 * Viewing mode:
 * - Tenants: default to local, can switch to global (lazy fetch)
 * - Global app: local is null → show global
 */
const useGlobal = ref(false)
const showing = computed<'local' | 'global'>(() => {
  if (useGlobal.value && hasGlobalLoaded.value) return 'global'
  return hasLocal.value ? 'local' : 'global'
})

/** Actions for toolbar (if used) */
function fetchGlobal() {
  profile.collection?.fetchGlobal?.()
}
function showGlobal() {
  fetchGlobal()
  useGlobal.value = true
}
function showLocal() {
  useGlobal.value = false
}

/** Final list selection with safe fallbacks */
const list = computed<any[]>(() => {
  if (showing.value === 'global')
    return (profile.collection?.global?.value as any[]) ?? []
  return (profile.collection?.local?.value as any[]) ?? []
})

/** Navigation helper */
const router = useRouter()
function navigate(profileDoc: any) {
  const id = profileDoc?.id || profileDoc?.uid
  if (!id) return
  const base = props.basePath ?? `/${props.config.collectionName}`
  router.push(base.endsWith('/') ? `${base}${id}` : `${base}/${id}`)
}
</script>
