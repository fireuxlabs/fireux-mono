<template>
  <slot
    v-if="hasDefaultSlot"
    :directory-entries="directoryEntries"
    :total-apps="totalApps"
  />

  <UCard v-else class="fx-section">
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
      <article v-for="entry in directoryEntries" :key="entry.key">
        <OrganismsAppCardsPill :app="entry.pill" />
      </article>
    </div>

    <p v-else class="fx-section__empty">No apps found in the collection.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useAppCollection } from '../../../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const slots = useSlots()
const hasDefaultSlot = computed(() => Boolean(slots.default))

const { apps } = useAppCollection()
const { pillProps } = useAppInterface()

const directoryEntries = computed(() => {
  const list = apps.value ?? []
  if (!list.length) return []

  return list.map((entry) => {
    const app = entry as App
    const pill = pillProps(app)
    const key = entry?.id ?? `${pill.title}-${pill.subtitle || ''}`
    return {
      key,
      pill,
    } satisfies { key: string; pill: AppCard.Pill }
  })
})

const totalApps = computed(() => directoryEntries.value.length)
</script>
