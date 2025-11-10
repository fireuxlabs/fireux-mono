<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">App Collection</h2>
          <p class="text-xs text-gray-500">
            All apps available to this runtime, resolved from
            <code>/apps</code>.
          </p>
        </div>
        <UBadge variant="soft">{{ totalApps }} total</UBadge>
      </div>
    </template>

    <div v-if="directoryEntries.length" class="fx-section__grid">
      <article
        v-for="entry in directoryEntries"
        :key="entry.key"
        class="space-y-2"
      >
        <MoleculesPill v-bind="entry.pill" />
      </article>
    </div>

    <p v-else class="fx-section__empty">No apps found in the collection.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'
import { useAppInterface } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppInterface.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
const { apps } = useAppCollection()
const { pillProps } = useAppInterface()

type DirectoryEntry = { key: string; pill: Pill.Props }

const directoryEntries = computed<DirectoryEntry[]>(() => {
  const list = apps.value ?? []
  if (!list.length) return []

  return list.map((entry) => {
    const app = entry as App
    const pill = pillProps(app)
    const key = entry?.id ?? `${pill.title}-${pill.subtitle || ''}`
    return {
      key,
      pill,
    }
  })
})

const totalApps = computed(() => directoryEntries.value.length)
</script>
