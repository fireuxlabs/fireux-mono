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

          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsAppCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsAppCardsPill
            :to="card.to"
            :thumbnail-url="card.thumbnailUrl"
            :display-name="card.displayName"
            :ecosystem="card.ecosystem"
            :badges="card.badges"
            :link="Boolean(card.to)"
          />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <OrganismsAppCardsCell
            :to="card.to"
            :thumbnail-url="card.thumbnailUrl"
            :display-name="card.displayName"
            :badges="card.badges"
            :tagline="card.tagline"
            :user-count="card.userCount"
            :link="Boolean(card.to)"
          />
        </NuxtLink>
      </template>
    </OrganismsAppCollectionList>

    <p v-else>
      {{ query ? 'No apps match your search.' : 'No apps found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Apps (JSON)'"
        context="collection manager · apps"
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
