<template>
  <UPageCard title="Ecosystem" variant="subtle">
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm text-dimmed">My apps</p>
        <UBadge v-if="appCards.length" color="neutral" variant="soft">
          {{ appCards.length }}
        </UBadge>
      </div>

      <div v-if="isLoading" class="space-y-2">
        <USkeleton class="h-16 w-full" />
        <USkeleton class="h-16 w-full" />
      </div>

      <div v-else-if="appCards.length" class="space-y-2">
        <OrganismsAppCardsCell
          v-for="app in appCards"
          :key="app.id || app.app_name"
          :app="app"
        />
      </div>

      <p v-else class="text-sm text-dimmed">No apps yet.</p>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useAppInterface } from '../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import type { App } from '../../models/core/app.model'

const { user, pending: userPending } = useUser()
const { firestoreFetchCollection } = useFirestoreRead()
const appsRef = firestoreFetchCollection<App>('apps')
const { cellProps } = useAppInterface()

const appIds = computed(() => {
  const ids = [
    ...((user.value?.userOf ?? []) as string[]),
    ...((user.value?.adminOf ?? []) as string[]),
  ]

  return Array.from(
    new Set(
      ids
        .map((id) => (id ?? '').toString().trim())
        .filter((id) => id.length > 0)
    )
  )
})

const appCards = computed(() => {
  if (!appIds.value.length) return []
  const idSet = new Set(appIds.value)
  return (appsRef.value ?? [])
    .filter((app) => Boolean(app?.id) && idSet.has(app.id))
    .map((app) => cellProps(app))
    .sort((a, b) => (a.app_name || '').localeCompare(b.app_name || ''))
})

const appsPending = computed(() => appsRef.value === undefined)
const isLoading = computed(
  () => Boolean(userPending.value) || Boolean(appsPending.value)
)
</script>
