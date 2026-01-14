<!-- FILE: packages/core/fireux-core/src/runtime/pages/dev/users.vue -->
<template>
  <UPage>
    <UPageBody class="pagebody space-y-8">
      <DevPane
        title="Current user"
        description="Resolved /users/<uid> for this runtime."
        :debug-data="currentUserDev"
        :default-open="hasCurrentUser"
      >
        <template #actions>
          <UButton v-if="hasCurrentUser" size="xs" variant="ghost" @click="toggleUserView">
            {{ userView === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </template>

        <MoleculesStateCard
          v-if="isLoading"
          entity="user"
          kind="document"
          loading
        />

        <MoleculesStateCard
          v-else-if="!hasCurrentUser"
          entity="user"
          kind="document"
        />

        <div v-else class="space-y-4">
          <OrganismsUserCardsPreview
            v-if="userView === 'preview' && currentUser"
            v-bind="card(currentUser)"
          />

          <OrganismsUserCardsProfile
            v-else-if="currentUser"
            v-bind="card(currentUser)"
            :user="currentUser"
          />
        </div>
      </DevPane>

      <DevPane
        title="App memberships"
        description="Live /apps/{id}/users memberships and counts."
        :debug-data="membershipsDev"
        :default-open="hasMemberships"
      >
        <div class="space-y-4">
          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-base font-semibold">App memberships</h2>
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
            <DevJson
              v-if="membershipsJson"
              label="Memberships"
              :data="membershipsJson"
            />
            <DevJson
              v-if="scopedUsersJson"
              label="Scoped Users (hydrated)"
              :data="scopedUsersJson"
            />
          </div>
          <p v-if="!membershipCount" class="text-sm text-gray-500">
            No app user records streamed yet.
          </p>
        </div>
      </DevPane>

      <DevPane
        title="User collection"
        description="Browse users available to this runtime."
      >
        <OrganismsUserCollectionManager />
      </DevPane>

      <DevPane
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
import { definePageMeta } from '#imports'
import { useCardViewToggle } from '../../composables/shared/useCardViewToggle'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useUserCollection } from '../../composables/fireux/firestore/core/user/fetch/useUserCollection'
import { useAppUsers } from '../../composables/fireux/firestore/core/app/fetch/useAppUsers'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
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

const { currentUser, isLoading, card } = useUser()
const { users: usersCollection, fulfilled: hydratedAppUsers } = useUserCollection()
const fireux = useFireUXConfig()

const { users: appUsers, pending: appUsersPending } = useAppUsers()
const { getChecksForScope } = useDevHealth()

const users = computed(() => usersCollection.value ?? [])
const hasCurrentUser = computed(() => Boolean(currentUser.value))
const { view: userView, toggleView: toggleUserView } = useCardViewToggle(() => hasCurrentUser.value)
const membershipCount = computed(() => appUsers.value?.length ?? 0)
const scopedUsers = computed(() => hydratedAppUsers?.value ?? [])
const hydratedCount = computed(() => scopedUsers.value.length)

const membershipsJson = computed(() =>
  membershipCount.value ? appUsers.value : null
)
const scopedUsersJson = computed(() =>
  scopedUsers.value.length ? scopedUsers.value : null
)

const hasMemberships = computed(() => membershipCount.value > 0)

const currentUserDev = computed(() => ({
  flags: {
    isLoading: isLoading.value,
    hasUser: hasCurrentUser.value,
  },
  user: currentUser.value,
}))

const membershipsDev = computed(() => ({
  count: membershipCount.value,
  hydratedCount: hydratedCount.value,
  pending: appUsersPending.value,
  memberships: appUsers.value ?? [],
  scopedUsers: scopedUsers.value,
}))

const userHealthChecks = getChecksForScope('users')
const previewUser = computed(
  () => currentUser.value ?? users.value?.[0] ?? null
)
</script>
