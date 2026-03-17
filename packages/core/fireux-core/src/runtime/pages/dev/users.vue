<template>
  <UPage>
    <UPageHeader
      title="Dev · Users"
      description="Model shape for Users collection."
    />

    <UPageBody class="pagebody">
      <UCard variant="subtle">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Mode:
          <span class="font-mono">
            {{ isTenant ? 'tenant (single app)' : 'global (all apps)' }}
          </span>
        </div>
      </UCard>

      <DevModel
        :title="'Users · Model'"
        :model="userModelRuntime"
      />

      <UCard>
        <template #header>
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Users collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Filter users by model drift (extra fields) before browsing records.
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

      <UserCollectionManager :collection="filteredUsers" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useUserCollection } from '../../composables/fireux/firestore/core/user/fetch/useUserCollection'
import { User as UserModelRuntime } from '../../models/core/user.model'

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

const userModelRuntime = UserModelRuntime

const { users } = useUserCollection()

const { isTenant } = useFireUXConfig()

const userCollection = computed(() => users.value ?? [])

const {
  driftKind: usersDriftKind,
  setDriftKind: setUsersDriftKind,
  selectedField: usersSelectedField,
  driftById: usersDriftById,
  filterOptions: usersFilterOptions,
  filteredCollection: filteredUsers,
} = useDevDriftFilter({
  collection: userCollection,
  runtimeModel: userModelRuntime,
})

const filteredUsersDriftPayload = computed(() =>
  filteredUsers.value.map((user) => {
    const drift = usersDriftById.value.get(user.id) ?? { missing: [], extra: [] }
    return {
      id: user.id,
      displayName: user.display_name ?? '',
      drift,
    }
  })
)

const usersDriftCopyPayload = computed(() => ({
  modelPath: 'packages/core/fireux-core/src/runtime/models/core/user.model.ts',
  driftKind: usersDriftKind.value,
  selectedField: usersSelectedField.value || null,
  totalUsers: filteredUsers.value.length,
  users: filteredUsersDriftPayload.value,
}))

const updateUsersSelectedField = (value: string) => {
  usersSelectedField.value = value
}
</script>
