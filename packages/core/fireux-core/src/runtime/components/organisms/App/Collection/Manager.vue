<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Apps</h2>
          <p class="text-xs text-gray-500">
            Browse apps available to this runtime.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search apps…"
            class="w-44"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsAppCollectionList
      v-if="cards.length"
      :cards="cards"
      :variant="variant"
    />

    <p v-else class="fx-section__empty">
      {{ query ? 'No apps match your search.' : 'No apps found.' }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from '../../../../composables/shared/useCollectionSearch'
import { useAppCollection } from '../../../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { App } from '../../../../models/core/app.model'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const { apps, count: totalCount } = useAppCollection()
const { card, searchText } = useAppInterface()

const {
  query,
  variant,
  toggleVariant,
  visibleCount,
  cards,
} = useCollectionSearch<App, AppCard.Card>({
  items: apps,
  searchText,
  makeCard: card,
})
</script>
