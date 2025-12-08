<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">{{ collectionTitle }}</h2>
          <p class="text-xs text-gray-500">
            Streaming the canonical <code>/users</code> collection for this
            runtime.
          </p>
        </div>
        <UBadge variant="soft">{{ globalBadgeLabel }}</UBadge>
      </div>
    </template>

    <div v-if="directoryEntries.length" class="fx-section__grid">
      <div v-for="entry in directoryEntries" :key="entry.key" class="space-y-2">
        <OrganismsUserCardsPill :user="entry.pill" />
      </div>
    </div>

    <p v-else class="fx-section__empty">No users found.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'

const { firestoreFetchCollection } = useFirestoreRead()
const { appName, appId, isTenant } = useFireUXConfig()
const globalUsers = firestoreFetchCollection<User>('users')
const { pillProps } = useUserInterface(undefined, { runtime: 'global' })

type DirectoryEntry = {
  key: string
  pill: UserCard.Pill
  raw: User
}

const inferRole = (entry: User): 'admin' | 'user' | undefined => {
  const explicit = (entry.role ?? entry.appUser?.role)?.trim().toLowerCase()
  if (explicit === 'admin' || explicit === 'user') return explicit
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
    .filter((entry: any) => Boolean(entry?.id))
    .map((entry: User) => {
      const role = inferRole(entry)
      const enriched = role ? ({ ...entry, role } as User) : entry
      return {
        key: entry.id,
        pill: pillProps(enriched),
        raw: enriched,
      }
    })
})

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
