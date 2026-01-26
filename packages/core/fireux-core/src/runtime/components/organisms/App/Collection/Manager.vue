<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Apps</div>
          <p>Browse apps available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search apps…"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

      <ClientOnly>
        <OrganismsAppCollectionList
          v-if="cardsFiltered.length"
          :cards="cardsFiltered"
          :variant="variant"
        >
          <template #pill="{ card }">
            <component :is="card.to ? 'NuxtLink' : 'div'" :to="card.to || undefined">
              <OrganismsAppCardsPill v-bind="card" />
            </component>
          </template>
          <template #cell="{ card }">
            <component :is="card.to ? 'NuxtLink' : 'div'" :to="card.to || undefined">
              <OrganismsAppCardsCell v-bind="card" />
            </component>
          </template>
        </OrganismsAppCollectionList>

        <p v-else>
          {{ query ? 'No apps match your search.' : 'No apps found.' }}
        </p>
      </ClientOnly>

    <div v-if="isDev">
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
