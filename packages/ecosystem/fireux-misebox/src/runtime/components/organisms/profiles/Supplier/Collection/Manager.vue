<template>
  <div class="space-y-2">
    <UCard v-if="isTenant">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h2>App suppliers</h2>
          <UBadge variant="soft">{{ localTotal }} total</UBadge>
        </div>
        <p class="text-sm opacity-70">Suppliers scoped to this tenant application.</p>
      </template>

      <OrganismsProfilesSupplierCollectionList
        v-if="localCards.length"
        :cards="localCards"
        variant="pill"
      />

      <p v-else class="text-sm opacity-70">No tenant-scoped suppliers found.</p>
    </UCard>

    <section class="space-y-2">
      <div v-if="isTenant" class="flex items-center justify-end">
        <UButton variant="ghost" @click="showGlobalDirectory = !showGlobalDirectory">
          {{ showGlobalDirectory ? 'Hide global suppliers' : 'View global suppliers' }}
        </UButton>
      </div>

      <UCard v-if="showGlobalDirectory || !isTenant">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2>Global suppliers</h2>
            <UBadge variant="soft">{{ globalTotal }} total</UBadge>
          </div>
          <p class="text-sm opacity-70">Suppliers available across the FireUX network.</p>
        </template>

        <OrganismsProfilesSupplierCollectionList
          v-if="globalCards.length"
          :cards="globalCards"
          variant="pill"
        />

        <p v-else class="text-sm opacity-70">No global suppliers found.</p>
      </UCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import type { SupplierCore } from '../../../../../models/profiles/Supplier/Supplier.model.ts'
import { useSupplierCollection } from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection.ts'
import { useSupplier } from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier'
import type { SupplierCard } from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier'

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant)

const { globalSuppliers, localSuppliers } = useSupplierCollection()
const { card } = useSupplier()

type SupplierEntryWithUser = SupplierCore & { user?: any }

type DirectoryEntry = {
  key: string
  card: SupplierCard.Card
  raw: SupplierCore
}

const globalDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const list = globalSuppliers.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is SupplierEntryWithUser =>
      Boolean((entry as SupplierEntryWithUser | undefined)?.id)
    )
    .map((entry: SupplierEntryWithUser) => {
      const payload = card(entry, entry.user ?? null)
      if (!payload) return null
      const { user: _user, ...raw } = entry as any
      return { key: entry.id, card: payload, raw: raw as SupplierCore }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const localDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const list = localSuppliers?.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is SupplierEntryWithUser =>
      Boolean((entry as SupplierEntryWithUser | undefined)?.id)
    )
    .map((entry: SupplierEntryWithUser) => {
      const payload = card(entry, entry.user ?? null)
      if (!payload) return null
      const { user: _user, ...raw } = entry as any
      return { key: entry.id, card: payload, raw: raw as SupplierCore }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const globalCards = computed(() => globalDirectoryEntries.value.map((e) => e.card))
const localCards = computed(() => localDirectoryEntries.value.map((e) => e.card))

const globalTotal = computed(() => globalDirectoryEntries.value.length)
const localTotal = computed(() => localDirectoryEntries.value.length)
</script>
