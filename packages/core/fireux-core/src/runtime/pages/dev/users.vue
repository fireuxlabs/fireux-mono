<!-- FILE: packages/core/fireux-core/src/runtime/pages/dev/users.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UCard v-if="currentUser" class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h1 class="text-base font-semibold">Current User</h1>
          </div>
        </template>

        <div class="space-y-2">
          <OrganismsUserCardsPill :user="pillFor(currentUser)" />
        </div>

        <p class="text-sm font-mono text-gray-600">
          ID: <span class="text-black">{{ currentUser.id }}</span>
        </p>
      </UCard>
      <MoleculesStateCard
        v-else
        kind="document"
        entity="user"
        :loading="isLoading"
      />

      <UCard class="space-y-4">
        <template #header>
          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-base font-semibold">App Memberships</h2>
              <UBadge variant="soft">
                {{ membershipCount }} membership{{
                  membershipCount === 1 ? '' : 's'
                }}
              </UBadge>
            </div>
            <p class="text-xs text-gray-500">
              Scoped to app {{ fireux.appId }} · Pending: {{ appUsersPending }}
            </p>
          </div>
        </template>

        <div class="grid gap-3 md:grid-cols-3">
          <div
            class="flex flex-col gap-1 rounded-lg border border-gray-200 p-3"
          >
            <span class="text-xs uppercase tracking-wide text-gray-500">
              Membership Docs
            </span>
            <span class="text-2xl font-semibold">{{ membershipCount }}</span>
          </div>
          <div
            class="flex flex-col gap-1 rounded-lg border border-gray-200 p-3"
          >
            <span class="text-xs uppercase tracking-wide text-gray-500">
              Hydrated Profiles
            </span>
            <span class="text-2xl font-semibold">{{ hydratedCount }}</span>
          </div>
          <div
            class="flex flex-col gap-1 rounded-lg border border-gray-200 p-3"
          >
            <span class="text-xs uppercase tracking-wide text-gray-500">
              Tenant Mode
            </span>
            <span class="text-2xl font-semibold">
              {{ fireux.isTenant ? 'Tenant' : 'Global' }}
            </span>
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <DevJsonPanel
            v-if="membershipsJson"
            label="Memberships"
            :data="membershipsJson"
          />
          <DevJsonPanel
            v-if="scopedUsersJson"
            label="Scoped Users (hydrated)"
            :data="scopedUsersJson"
          />
        </div>
        <p v-if="!membershipCount" class="text-sm text-gray-500">
          No app user records streamed yet.
        </p>
      </UCard>

      <UCard v-if="users.length" class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">Users Collection</h2>
          </div>
        </template>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(u, index) in users"
            :key="u.id || index"
            class="space-y-2 rounded-lg border border-gray-200 p-3"
          >
            <OrganismsUserCardsPill :user="pillFor(u)" />
          </div>
        </div>
        <DevJsonPanel v-if="usersJson" :data="usersJson" />
      </UCard>
      <MoleculesStateCard v-else kind="collection" entity="users" />

      <DevHealthPanel
        title="User health checks"
        description="Compares user.adminOf, app admin lists, and tenant membership roles."
        :checks="userHealthChecks"
      />

      <DevUserComponentGallery :user="previewUser" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import { useUser } from '../../composables/firestore/core/user/useUser'
import { useUserCollection } from '../../composables/firestore/core/user/main/useUserCollection'
import { useUserInterface } from '../../composables/firestore/core/user/state/useUserInterface'
import { useAppUsers } from '../../composables/firestore/core/app/data/users'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { useDevHealth } from '../../composables/dev/health/useDevHealth'
import DevUserComponentGallery from '../../components/dev/UserComponentGallery.vue'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/users'],
  nav: {
    key: 'dev-users',
    label: 'Users',
    icon: 'i-lucide-users',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 30,
  },
})

const { currentUser, isLoading } = useUser()
const userCollections = useUserCollection()
const { users: usersCollection, fulfilled: hydratedAppUsers } = userCollections
const { pillProps: collectionPill } = useUserInterface()
const fireux = useFireUXConfig()

const { users: appUsers, pending: appUsersPending } = useAppUsers()
const { getChecksForScope } = useDevHealth()

const pillFor = (target: User | any | null | undefined) => {
  if (!target) return null
  const base = target?.coreUser ?? target
  return collectionPill(base)
}

const users = computed(() => usersCollection.value ?? [])

const usersJson = computed(() => {
  const list = users.value
  return list.length ? list : null
})

const membershipCount = computed(() => appUsers.value?.length ?? 0)
const scopedUsers = computed(() => hydratedAppUsers?.value ?? [])
const hydratedCount = computed(() => scopedUsers.value.length)

const membershipsJson = computed(() =>
  membershipCount.value ? appUsers.value : null
)
const scopedUsersJson = computed(() =>
  scopedUsers.value.length ? scopedUsers.value : null
)
const userHealthChecks = getChecksForScope('users')
const previewUser = computed(
  () => currentUser.value ?? users.value?.[0] ?? null
)
</script>
