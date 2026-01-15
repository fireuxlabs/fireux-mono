<template>
  <div class="space-y-2">
    <UCard v-if="isTenant">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h2>App professionals</h2>
          <UBadge variant="soft">{{ localTotal }} total</UBadge>
        </div>
        <p class="text-sm opacity-70">Professionals scoped to this tenant application.</p>
      </template>

      <OrganismsProfilesProfessionalCollectionList
        v-if="localCards.length"
        :cards="localCards"
        variant="pill"
      />

      <p v-else class="text-sm opacity-70">No tenant-scoped professionals found.</p>
    </UCard>

    <section class="space-y-2">
      <div v-if="isTenant" class="flex items-center justify-end">
        <UButton variant="ghost" @click="showGlobalDirectory = !showGlobalDirectory">
          {{
            showGlobalDirectory
              ? 'Hide global professionals'
              : 'View global professionals'
          }}
        </UButton>
      </div>

      <UCard v-if="showGlobalDirectory || !isTenant">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2>Global professionals</h2>
            <UBadge variant="soft">{{ globalTotal }} total</UBadge>
          </div>
          <p class="text-sm opacity-70">
            Professionals available globally in this FireUX environment.
          </p>
        </template>

        <OrganismsProfilesProfessionalCollectionList
          v-if="globalCards.length"
          :cards="globalCards"
          variant="pill"
        />

        <p v-else class="text-sm opacity-70">No global professionals found.</p>
      </UCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model.ts'
import { useProfessionalCollection } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import { useProfessional } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional.ts'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional.ts'

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(true)

const { globalProfessionals, localProfessionals } = useProfessionalCollection()
const { card } = useProfessional()

type DirectoryEntry = {
  key: string
  card: ProfessionalCard.Card
  raw: ProfessionalCore
}

const globalDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const list = globalProfessionals.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is ProfessionalCore =>
      Boolean((entry as ProfessionalCore | undefined)?.id)
    )
    .map((entry: ProfessionalCore) => {
      const payload = card(entry, (entry as any)?.user ?? null)
      if (!payload) return null
      return { key: entry.id, card: payload, raw: entry }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const localDirectoryEntries = computed<DirectoryEntry[]>(() => {
  const list = localProfessionals.value ?? []
  if (!list.length) return []

  return list
    .filter((entry: unknown): entry is ProfessionalCore =>
      Boolean((entry as ProfessionalCore | undefined)?.id)
    )
    .map((entry: ProfessionalCore) => {
      const payload = card(entry, (entry as any)?.user ?? null)
      if (!payload) return null
      return { key: entry.id, card: payload, raw: entry }
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry))
})

const globalCards = computed(() => globalDirectoryEntries.value.map((e) => e.card))
const localCards = computed(() => localDirectoryEntries.value.map((e) => e.card))

const globalTotal = computed(() => globalDirectoryEntries.value.length)
const localTotal = computed(() => localDirectoryEntries.value.length)
</script>
