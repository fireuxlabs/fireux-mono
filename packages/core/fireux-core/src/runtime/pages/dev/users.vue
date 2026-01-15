<template>
  <UPage>
    <UPageHeader
      title="Dev · Users"
      description="Collection-first view; filter by missing or extra fields (against the runtime model)."
    />

    <UPageBody class="space-y-10">
      <DevPane
        title="User collection"
        description="Browse users resolved for this runtime and filter by model drift."
      >
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span class="font-medium">Drift:</span>

          <UButton
            size="xs"
            :variant="driftKind === 'missing' ? 'solid' : 'ghost'"
            color="primary"
            @click="setDriftKind('missing')"
          >
            Missing
          </UButton>

          <UButton
            size="xs"
            :variant="driftKind === 'extra' ? 'solid' : 'ghost'"
            color="primary"
            @click="setDriftKind('extra')"
          >
            Extra
          </UButton>

          <span class="font-medium ml-2">
            Filter {{ driftKind }}:
          </span>

          <UButton
            v-for="option in filterOptions"
            :key="option.value"
            size="xs"
            :variant="selectedField === option.value ? 'solid' : 'ghost'"
            color="primary"
            @click="selectedField = option.value"
          >
            {{ option.label }}
          </UButton>

          <UButton
            size="xs"
            variant="outline"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyFiltered"
          >
            {{ copying ? 'Copying…' : 'Copy filtered drift' }}
          </UButton>
        </div>

        <OrganismsUserCollectionManager
          :cards="filteredUserCards"
          :total="viewedCollection.length"
        />
      </DevPane>

      <DevPane
        title="Users (JSON)"
        description="Raw collection payload + drift map (copyable)."
        debug-title="Dev · Users · All data"
        :debug-data="allJsonPayload"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { definePageMeta, useRoute } from '#imports'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'
import { useDevDriftFilter } from '../../composables/dev/useDevDriftFilter'
import { useUserCollection } from '../../composables/fireux/firestore/core/user/fetch/useUserCollection'
import { useUserInterface } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { User as UserModelRuntime } from '../../models/core/user.model'
import type { User } from '../../models/core/user.model'
import type { UserCard } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

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
  title: 'Dev · Users',
  description: 'Developer view for Users (collection-first).',
})

const route = useRoute()
const userIdFilter = computed(() =>
  typeof route.query.userId === 'string' ? route.query.userId : ''
)

const { users: usersRaw } = useUserCollection()
const { card: makeCard } = useUserInterface()
const { copyJSON, copying } = useDevClipboard()

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

const userCards = computed<UserCard.Card[]>(() =>
  viewedCollection.value
    .map((user) => makeCard(user))
    .filter((c): c is UserCard.Card => Boolean(c))
)

const {
  driftKind,
  setDriftKind,
  selectedField,
  driftById,
  filterOptions,
} = useDevDriftFilter({
  collection: viewedCollection,
  runtimeModel: UserModelRuntime as unknown as Record<string, unknown>,
})

const filteredUserCards = computed<UserCard.Card[]>(() => {
  if (!selectedField.value) return userCards.value

  return userCards.value.filter((card) => {
    const drift = driftById.value.get(card.id)
    if (!drift) return false
    const list = driftKind.value === 'missing' ? drift.missing : drift.extra
    return list.includes(selectedField.value)
  })
})

const filteredPayload = computed(() =>
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
  userIdFilter: userIdFilter.value || null,
  users: viewedCollection.value,
  driftById: Object.fromEntries(driftById.value),
}))

const copyFiltered = async () => {
  await copyJSON(
    {
      userIdFilter: userIdFilter.value || null,
      driftKind: driftKind.value,
      selectedField: selectedField.value || null,
      users: filteredPayload.value,
    },
    { label: 'Dev · Users · Filtered drift' }
  )
}
</script>
