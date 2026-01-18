<template>
  <UPage>
    <UPageHeader
      title="Dev · Users"
      description="Model shape for Users collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Users · Model'"
          :model="userModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Users collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse users resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="usersDriftKind"
                :selected-field="usersSelectedField"
                :filter-options="usersFilterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Users'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setUsersDriftKind"
                @update:selected-field="updateUsersSelectedField"
                @copy="copyUsersDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Users (JSON)'"
            :data="allUsersJsonPayload"
            :default-open="false"
          />
        </template>

        <OrganismsUserCollectionManager
          :cards="cards"
          :total="total"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard';
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter';
import { computed } from 'vue';
import { useGlobalUserCollection } from '../../composables/fireux/firestore/core/user/fetch/useGlobalUserCollection';
import { useUserInterface } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface';
import { User as UserModelRuntime } from '../../models/core/user.model';

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

const { users, count } = useGlobalUserCollection()
const { card: makeCard } = useUserInterface()

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

const cards = computed(() =>
  filteredUsers.value
    .map((user) => makeCard(user))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const total = computed(() => count.value ?? cards.value.length)

const allUsersJsonPayload = computed(() => ({
  totalUsers: userCollection.value.length,
  users: userCollection.value,
}))

const filteredUsersDriftPayload = computed(() =>
  cards.value.map((card) => {
    const drift = usersDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      drift,
    }
  })
)

const { copyJSON, copying } = useDevClipboard()

const copyUsersDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/core/fireux-core/src/runtime/models/core/user.model.ts',
      driftKind: usersDriftKind.value,
      selectedField: usersSelectedField.value || null,
      totalUsers: total.value,
      users: filteredUsersDriftPayload.value,
    },
    { label: 'Dev · Users · Filtered drift' }
  )
}

const updateUsersSelectedField = (value: string) => {
  usersSelectedField.value = value
}
</script>
