<template>
  <UPage>
    <UPageHeader
      title="Dev · Users"
      description="Model shape for Users collection."
    />

    <UPageBody class="pagebody">
      <UCard variant="subtle">
        <div class="text-xs text-muted">
          Mode:
          <span class="font-mono">
            {{ modeLabel }}
          </span>
        </div>
      </UCard>

      <DevModel :title="'Users · Model'" :model="userModelRuntime" />

      <UCard v-if="signedInUserPreview || signedInUserSummary" variant="subtle">
        <template #header>
          <div class="text-sm font-semibold">Current user</div>
        </template>

        <div class="space-y-4">
          <UserCardsPreview
            v-if="signedInUserPreview"
            v-bind="signedInUserPreview"
          />

          <div v-if="signedInUserSummary" class="space-y-1 text-xs text-dimmed">
            <div>
              UID: <span class="font-mono">{{ signedInUserSummary.id }}</span>
            </div>
            <div v-if="signedInUserSummary.email">
              Email:
              <span class="font-mono">{{ signedInUserSummary.email }}</span>
            </div>
            <div v-if="signedInUserSummary.handle">
              Handle:
              <span class="font-mono">{{ signedInUserSummary.handle }}</span>
            </div>
          </div>

<DevDebugPanel
  object-origin="fetched"
            launcher
            include-route
            v-if="signedInUserJson"
            :title="'Current user (JSON)'"
            :context="'dev users · signed-in user · resolved user payload'"
            :objects="signedInUserJson"
  :derived="{}"
            :default-open="false"
          />
        </div>
      </UCard>

      <UAlert
        v-if="usersErrorMessage"
        color="warning"
        variant="soft"
        title="Users collection unavailable"
        :description="usersErrorMessage"
      />

      <UCard>
        <template #header>
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Users collection
            </p>
            <p class="text-xs text-muted">
              Inspect model drift separately from the public users collection
              manager.
            </p>
            <DevDriftToolbar
              :drift-kind="usersDriftKind"
              :selected-field="usersSelectedField"
              :filter-options="usersFilterOptions"
              :copy-label="'Copy drift · Users'"
              :copy-payload="usersDriftCopyPayload"
              @update:drift-kind="setUsersDriftKind"
              @update:selected-field="updateUsersSelectedField"
            />
          </div>
        </template>
      </UCard>

      <UserCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 13:29 CEST — User raw-list cutoff: inspect the bounded public User projection.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: keep projected User model inspection biography-aware.
import { definePageMeta, useFetch } from '#imports'
import { useDevDriftFilter } from '../../composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useAvatarProxy } from '../../composables/fireux/app/ui/useAvatarProxy'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUser } from '../../user/composables/useUser'
import type { PublicUserDto } from '../../server/utils/public-projection/public-dto.types'
import type { User } from '../../user/models/user.model.ts'
import { UserDefaults } from '../../user/models/user.model.ts'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-users',
    label: 'Users',
    icon: 'i-lucide-users',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 30,
  },
  title: 'Dev · Users',
  description: 'Developer view for Users (collection-first).',
})

const publicUsers = useFetch<{
  items: PublicUserDto[]
  users?: PublicUserDto[]
}>('/api/public/users', { key: 'dev-public-users', query: { limit: 200 } })
const users = computed<User[]>(() => {
  const payload = publicUsers.data.value
  const items = Array.isArray(payload?.users)
    ? payload.users
    : (payload?.items ?? [])
  return items.map(
    (user) =>
      ({
        id: user.id,
        display_name: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        handle: user.handle,
      }) as User
  )
})
const usersError = publicUsers.error

const { role } = useFireUXConfig()
const userModelRuntime = UserDefaults
const { currentUser: authUser } = useAuth()
const {
  currentUser,
  appUser,
  avatarSrc,
  pill: userInterface,
  isPremium,
  canOwnMultipleConsoles,
} = useUser()
const { getProxiedAvatarUrl } = useAvatarProxy()

const userCollection = computed(() => users.value ?? [])
const usersErrorMessage = computed(() => {
  const error = usersError.value as
    | { code?: string; message?: string }
    | undefined
  if (!error) return ''
  if (error.code === 'permission-denied') {
    return 'This runtime cannot load the bounded public User projection.'
  }
  return error.message || 'Unable to read the root /users collection.'
})
const modeLabel = computed(() => {
  if (role === 'tenant') return 'tenant (single app)'
  if (role === 'standalone') return 'standalone (all apps)'
  return 'global (all apps)'
})

const {
  driftKind: usersDriftKind,
  setDriftKind: setUsersDriftKind,
  selectedField: usersSelectedField,
  driftById: usersDriftById,
  filterOptions: usersFilterOptions,
  filteredCollection: filteredUsers,
} = useDevDriftFilter({
  collection: userCollection,
  runtimeModel: UserDefaults,
})

const filteredUsersDriftPayload = computed(() =>
  filteredUsers.value.map((user) => {
    const drift = usersDriftById.value.get(user.id) ?? {
      missing: [],
      extra: [],
    }
    return {
      id: user.id,
      displayName: user.display_name ?? '',
      drift,
    }
  })
)

const usersDriftCopyPayload = computed(() => ({
  modelPath: 'packages/core/fireux-core/src/runtime/user/models/user.model.ts',
  driftKind: usersDriftKind.value,
  selectedField: usersSelectedField.value || null,
  totalUsers: filteredUsers.value.length,
  users: filteredUsersDriftPayload.value,
}))

const signedInUserSummary = computed(() => {
  const id = String(currentUser.value?.id || authUser.value?.uid || '').trim()
  if (!id) return null

  const displayName = String(
    currentUser.value?.display_name || authUser.value?.displayName || ''
  ).trim()
  const parts = displayName.split(/\s+/).filter(Boolean)
  const initials =
    parts.length > 1
      ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'U'
      : parts[0]?.slice(0, 2).toUpperCase() || 'U'

  return {
    id,
    displayName,
    handle: String(currentUser.value?.handle || '').trim(),
    email: String(
      currentUser.value?.email || authUser.value?.email || ''
    ).trim(),
    avatarUrl: getProxiedAvatarUrl(
      String(avatarSrc.value || authUser.value?.photoURL || '').trim() ||
        undefined
    ),
    initials,
  }
})

const signedInUserPreview = computed(() => userInterface(currentUser.value))

const signedInUserJson = computed(() => {
  if (currentUser.value) {
    return {
      ...currentUser.value,
      appUser: appUser.value ?? null,
      permissions: {
        isPremium: isPremium.value,
        canOwnMultipleConsoles: canOwnMultipleConsoles.value,
      },
    }
  }
  if (!authUser.value?.uid) return null

  return {
    id: authUser.value.uid,
    display_name: authUser.value.displayName || '',
    email: authUser.value.email || '',
    avatar: authUser.value.photoURL || '',
  }
})

const updateUsersSelectedField = (value: string) => {
  usersSelectedField.value = value
}
</script>
