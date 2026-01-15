<template>
  <div class="space-y-2">
    <UCard v-if="isTenant">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h2>App chefs</h2>
          <UBadge variant="soft">{{ localTotal }} total</UBadge>
        </div>
        <p class="text-sm opacity-70">Chefs scoped to this tenant application.</p>
      </template>

      <OrganismsProfilesChefCollectionList
        v-if="localCards.length"
        :cards="localCards"
        variant="pill"
      />

      <p v-else class="text-sm opacity-70">No tenant-scoped chefs found.</p>
    </UCard>

    <section class="space-y-2">
      <div v-if="isTenant" class="flex items-center justify-end">
        <UButton variant="ghost" @click="showGlobalDirectory = !showGlobalDirectory">
          {{ showGlobalDirectory ? 'Hide global chefs' : 'View global chefs' }}
        </UButton>
      </div>

      <UCard v-if="showGlobalDirectory || !isTenant">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2>Global chefs</h2>
            <UBadge variant="soft">{{ globalTotal }} total</UBadge>
          </div>
          <p class="text-sm opacity-70">Chefs available across the FireUX network.</p>
        </template>

        <OrganismsProfilesChefCollectionList
          v-if="globalCards.length"
          :cards="globalCards"
          variant="pill"
        />

        <p v-else class="text-sm opacity-70">No global chefs found.</p>
      </UCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { computed, ref } from 'vue'
import { useChefCollection } from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefCollection.ts'
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef'
import { useChef } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef'
import type { ChefCore } from '../../../../../models/profiles/Chef/Chef.model.ts'

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant)

const { globalChefs, localChefs } = useChefCollection()
const { card } = useChef()

type ChefEntryWithUser = ChefCore & { user?: any }

type DirectoryEntry = {
  key: string
  card: ChefCard.Card
  raw: ChefCore
}

const globalDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const list = globalChefs.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is ChefEntryWithUser =>
      Boolean((entry as ChefEntryWithUser | undefined)?.id)
    )
    .map((entry: ChefEntryWithUser) => {
      const payload = card(entry, entry.user ?? null)
      if (!payload) return null
      const { user: _user, ...raw } = entry as any
      return { key: entry.id, card: payload, raw: raw as ChefCore }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const localDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const list = localChefs?.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is ChefEntryWithUser =>
      Boolean((entry as ChefEntryWithUser | undefined)?.id)
    )
    .map((entry: ChefEntryWithUser) => {
      const payload = card(entry, entry.user ?? null)
      if (!payload) return null
      const { user: _user, ...raw } = entry as any
      return { key: entry.id, card: payload, raw: raw as ChefCore }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const globalCards = computed(() => globalDirectoryEntries.value.map((e) => e.card))
const localCards = computed(() => localDirectoryEntries.value.map((e) => e.card))

const globalTotal = computed(() => globalDirectoryEntries.value.length)
const localTotal = computed(() => localDirectoryEntries.value.length)
</script>
