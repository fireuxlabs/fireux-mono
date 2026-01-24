<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Apps</div>
          <p class="text-xs text-dimmed">Browse apps available to this runtime.</p>
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
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No apps match your search.' : 'No apps found.' }}
    </p>

    <div v-if="isDev" class="pt-3">
      <DevJson
        :title="'Apps (JSON)'"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';
import { useCollectionSearch } from '../../../../composables/shared/useCollectionSearch';
import type { AppModel } from '../../../../models/core/app.model';

const props = defineProps<{ collection?: AppModel[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useAppInterface()
const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<AppModel, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (app) => searchText(app),
  makeCard: (app) => makeCard(app),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
