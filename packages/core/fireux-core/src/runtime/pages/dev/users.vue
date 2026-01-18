<template>
  <UPage>
    <UPageHeader
      title="Dev · Users"
      description="Collection-first view; filter by missing or extra fields (against the runtime model)."
    />

    <UPageBody class="space-y-10">
      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                User collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse users resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="driftKind"
                :selected-field="selectedField"
                :filter-options="filterOptions"
                :copy-label="copying ? 'Copying…' : 'Copy drift · Users'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setDriftKind"
                @update:selected-field="updateSelectedField"
                @copy="copyFiltered"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Dev · Users · All data'"
            :data="allJsonPayload"
            :default-open="false"
          />
        </template>

        <OrganismsUserCollectionManager
          :cards="filteredUserCards"
          :total="viewedCollection.length"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta, useRoute } from '#imports'
import { computed } from 'vue'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'
import { useDevDriftFilter } from '../../composables/dev/useDevDriftFilter'
import { useUserCollection } from '../../composables/fireux/firestore/core/user/fetch/useUserCollection'
import type { UserCard } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useUserInterface } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { User } from '../../models/core/user.model'
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

const route = useRoute()
const userIdFilter = computed(() =>
  typeof route.query.userId === 'string' ? route.query.userId : ''
)

const { users: usersRaw } = useUserCollection()
const { card: makeCard } = useUserInterface()
const userCollection = computed<User[]>(() =>
  (usersRaw.value ?? [])
    .map((entry: unknown) => (entry as any)?.coreUser ?? entry)
    .filter((u: any): u is User => Boolean(u?.id))
)

const viewedCollection = computed<User[]>(() =>
  userIdFilter.value
    ? userCollection.value.filter((u) => u.id === userIdFilter.value)
    : userCollection.value
)

const { copyJSON, copying } = useDevClipboard()

const userModelRuntime = UserModelRuntime as unknown as Record<string, unknown>

const {
  driftKind,
  setDriftKind,
  selectedField,
  driftById,
  filterOptions,
  filteredCollection,
} = useDevDriftFilter({
  collection: viewedCollection,
  runtimeModel: userModelRuntime,
})

const filteredUserCards = computed<UserCard.Card[]>(() =>
  filteredCollection.value
    .map((user) => makeCard(user))
    .filter((c): c is UserCard.Card => Boolean(c))
)

const filteredDriftPayload = computed(() =>
  filteredUserCards.value.map((card) => {
    const drift = driftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      handle: card.handle,
      drift,
    }
  })
)

const allJsonPayload = computed(() => ({
  totalUsers: viewedCollection.value.length,
  users: viewedCollection.value,
}))

const copyFiltered = async () => {
  await copyJSON(
    {
      driftKind: driftKind.value,
      selectedField: selectedField.value || null,
      totalUsers: viewedCollection.value.length,
      users: filteredDriftPayload.value,
    },
    { label: 'Dev · Users · Filtered drift' }
  )
}

const updateSelectedField = (value: string) => {
  selectedField.value = value
}
</script>
