<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">{{ ecosystemName }} Users</h2>
          <p class="text-xs text-gray-500">
            Streaming the canonical <code>/users</code> collection for this
            runtime.
          </p>
        </div>
        <UBadge variant="soft">{{ globalBadgeLabel }}</UBadge>
      </div>
    </template>

    <div v-if="directoryEntries.length" class="fx-section__grid">
      <div v-for="entry in directoryEntries" :key="entry.key">
        <OrganismsUserCardsPill :user="entry.pill" />
      </div>
    </div>

    <p v-else class="fx-section__empty">No users found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUserInterface } from 'fireux-core/runtime/composables/firestore/core/user/state/useUserInterface.ts'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'

const { firestoreFetchCollection } = useFirestoreRead()
const { appName } = useFireUXConfig()
const globalUsers = firestoreFetchCollection<User>('users')
const { pillProps } = useUserInterface()

type DirectoryEntry = { key: string; pill: UserCard.Pill }

const directoryEntries = computed<DirectoryEntry[]>(() => {
  const list = globalUsers.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: any) => Boolean(entry?.id))
    .map((entry: User) => ({
      key: entry.id,
      pill: pillProps(entry),
    }))
})

const totalUsers = computed(() => globalUsers.value?.length ?? 0)
const ecosystemName = computed(() => appName?.trim() || 'Global')
const globalBadgeLabel = computed(() => {
  const count = totalUsers.value
  const suffix = count === 1 ? 'user' : 'users'
  return `${count} ${suffix} · ${ecosystemName.value}`
})
</script>
