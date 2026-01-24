<template>
  <UCard>
    <template #header>
      <div>
        <div>
          <div>Kitchens</div>
          <p>Browse kitchens available to this runtime.</p>
        </div>

        <div>
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search kitchens…"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsEntitiesKitchenCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else>
      {{ query ? 'No kitchens match your search.' : 'No kitchens found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Kitchens (JSON)'"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface';
import type { Kitchen } from '../../../../../models/objects/kitchen.model';

const props = defineProps<{ collection?: Kitchen[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useKitchenInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Kitchen, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (kitchen: Kitchen) => searchText(kitchen),
  makeCard: (kitchen: Kitchen) => makeCard(kitchen),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev

</script>
