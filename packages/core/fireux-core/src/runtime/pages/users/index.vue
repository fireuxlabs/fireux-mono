<template>
  <div class="page space-y-6">
    <!-- CTA (simple, unified) -->
    <OrganismsUserCTA />

    <!-- Your User -->
    <UCard v-if="me">
      <h3 class="mb-3">Your User</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <OrganismsUserCardsPill :user="me" />
        <OrganismsUserCardsProfile :user="me" />
      </div>
    </UCard>

    <!-- All Users (Core vs App) -->
    <UCard>
      <div class="flex items-center justify-between mb-3">
        <h3>
          All Users
          <span v-if="isTenantApp">(App)</span>
          <span v-else>(Core)</span>
          ({{ usersList.length }})
        </h3>
      </div>
      <div
        v-if="usersList.length"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <OrganismsUserCardsCell
          v-for="u in usersList"
          :key="u.id"
          :user="u"
          class="cursor-default"
        />
      </div>
      <p v-else class="opacity-70">No users found.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSeoMeta } from 'nuxt/app'
import { useUser } from '../../composables/firestore/user/useUser'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { useFirestoreRead } from '../../composables/firestore/useFirestoreRead'
import type { UnifiedUser } from '../../models/core/user.model'

const { role, appId } = useFireUXConfig()
const isTenantApp = computed(() => role === 'tenant')

// current unified user mapped to card profile shape
const { user } = useUser()
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
const me = computed<UnifiedUser.Card.Profile | null>(() => {
  const u: any = user.value
  if (!u) return null
  return {
    id: u.id,
    display_name: safeDisplay(
      [
        u.display_name,
        u.app?.display_name,
        u.core?.display_name,
        u.handle,
        u.id,
      ],
      'User'
    ),
    avatar: u.app?.avatar || u.core?.avatar,
    role: u.app?.role,
    handle: u.handle,
    app_profiles: u.app?.app_profiles || [],
    global_profiles: u.core?.global_profiles || [],
    created_at: u.core?.created_at || u.app?.created_at,
    updated_at: u.core?.updated_at || u.app?.updated_at,
  }
})

// list: fetch directly from Firestore based on role (no deprecated composables)
const { firestoreFetchCollection } = useFirestoreRead()
const coreUsers = firestoreFetchCollection<any>('core-users')
const appUsersRef = appId
  ? firestoreFetchCollection<any>(`apps/${appId}/users`)
  : ref<any[] | undefined>(undefined)

const usersList = computed<UnifiedUser.Card.Cell[]>(() => {
  const src = isTenantApp.value ? appUsersRef.value : coreUsers.value
  const arr: any[] = Array.isArray(src) ? src : []
  return arr.map((u: any) => ({
    id: u.id,
    display_name: safeDisplay([u.display_name, u.handle, u.id], 'User'),
    avatar: u.avatar,
    role: u.role,
    handle: u.handle,
    app_profiles: u.app_profiles || [],
    global_profiles: u.global_profiles || [],
  }))
})

useSeoMeta({
  title: 'Users',
  description: 'Unified users overview (role-aware)',
})
</script>

<style scoped>
.page {
  /* container spacing handled via space-y-6 */
}
</style>
