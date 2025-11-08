<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">App Directory</h2>
          <p class="text-xs text-gray-500">
            All apps available to this runtime, resolved from
            <code>/apps</code>.
          </p>
        </div>
        <UBadge variant="soft">{{ totalApps }} total</UBadge>
      </div>
    </template>

    <div v-if="directoryEntries.length" class="fx-section__grid">
      <MoleculesPill
        v-for="entry in directoryEntries"
        :key="entry.key"
        v-bind="entry.pill"
      />
    </div>

    <p v-else class="fx-section__empty">No apps found in the collection.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'
import { useAppInterface } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppInterface.ts'
const { apps } = useAppCollection()
const { pillProps } = useAppInterface()

const directoryEntries = computed(() => {
  const list = apps.value ?? []
  if (!list.length) return []

  return list.map((entry) => {
    const pill = pillProps(entry as any)
    const key = entry?.id ?? `${pill.title}-${pill.subtitle || ''}`
    return { key, pill }
  })
})

const totalApps = computed(() => directoryEntries.value.length)
</script>
