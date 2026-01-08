<template>
  <slot
    v-if="hasDefaultSlot"
    :directory-entries="directoryEntries"
    :collection-title="collectionTitle"
    :global-badge-label="globalBadgeLabel"
  />

  <UCard v-else class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">{{ collectionTitle }}</h2>
          <p class="text-xs text-gray-500">
            Streaming the canonical <code>/users</code> collection for this
            runtime.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            v-if="isTenant"
            size="xs"
            variant="ghost"
            @click="showGlobalDirectory = !showGlobalDirectory"
          >
            {{ showGlobalDirectory ? 'Hide global directory' : 'View global directory' }}
          </UButton>
          <UBadge variant="soft">{{ globalBadgeLabel }}</UBadge>
        </div>
      </div>
    </template>

    <template v-if="!isTenant || showGlobalDirectory">
      <div v-if="directoryEntries.length" class="space-y-4">
        <div class="space-y-2">
          <p class="text-xs text-gray-500">Pills</p>
          <OrganismsUserCollectionList :cards="cards" variant="pill" />
        </div>

        <div class="space-y-2">
          <p class="text-xs text-gray-500">Cells</p>
          <OrganismsUserCollectionList :cards="cards" variant="cell" />
        </div>
      </div>

      <p v-else class="fx-section__empty">No users found.</p>
    </template>

    <p v-else class="fx-section__empty">Global directory hidden.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
import { useFirestoreRead } from '../../../../composables/fireux/firestore/operations/useFirestoreRead'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { useUserInterface } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { User } from '../../../../models/core/user.model'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const slots = useSlots()
const hasDefaultSlot = computed(() => Boolean(slots.default))

const { firestoreFetchCollection } = useFirestoreRead()
const { appName, appId, isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant)
const globalUsers = firestoreFetchCollection<User>('users')
const { card } = useUserInterface()

type DirectoryEntry = {
  key: string
  card: UserCard.Card
  raw: User
}

const inferRole = (entry: User): 'admin' | 'user' | undefined => {
  const activeAppId = appId?.trim()
  if (!activeAppId) return undefined
  if (entry.adminOf?.some((id) => id === activeAppId)) return 'admin'
  if (entry.userOf?.some((id) => id === activeAppId)) return 'user'
  return undefined
}

const directoryEntries = computed<DirectoryEntry[]>(() => {
  const list = globalUsers.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is User => Boolean((entry as User | undefined)?.id))
    .map((entry: User) => {
      const role = inferRole(entry)

      const payload = card(entry)
      const badges = role === 'admin' ? ['Admin'] : []

      return {
        key: entry.id,
        card: { ...payload, badges },
        raw: entry,
      }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const cards = computed(() => directoryEntries.value.map((entry) => entry.card))

const totalUsers = computed(() => globalUsers.value?.length ?? 0)
const runtimeLabel = computed(() => appName?.trim() || 'Global')
const collectionTitle = computed(() =>
  isTenant ? 'Global Users' : `${runtimeLabel.value} Users`
)
const badgeRuntimeLabel = computed(() =>
  isTenant ? 'Global' : runtimeLabel.value
)
const globalBadgeLabel = computed(() => {
  const count = totalUsers.value
  const suffix = count === 1 ? 'user' : 'users'
  return `${count} ${suffix} · ${badgeRuntimeLabel.value}`
})
</script>
