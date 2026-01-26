<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Places</div>
          <p>Browse places available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search places…"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsEntitiesPlaceCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
      gap="0.5rem"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <PlaceCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <PlaceCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsEntitiesPlaceCollectionList>

    <p v-else>
      {{ query ? 'No places match your search.' : 'No places found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Places (JSON)'"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { usePlacesInterface } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';
import type { BasePlace } from '../../../../../models/objects/place.model';

const props = defineProps<{ collection?: BasePlace[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = usePlacesInterface()

const {
  query,
  variant,
  toggleVariant,
            <ClientOnly>
              <OrganismsEntitiesPlaceCollectionList
                v-if="cardsFiltered.length"
                :cards="cardsFiltered"
                :variant="variant"
                gap="0.5rem"
              >
                <template #pill="{ card }">
                  <component :is="card.to ? 'NuxtLink' : 'div'" :to="card.to || undefined">
                    <PlaceCardsPill v-bind="card" />
                  </component>
                </template>
                <template #cell="{ card }">
                  <component :is="card.to ? 'NuxtLink' : 'div'" :to="card.to || undefined">
                    <PlaceCardsCell v-bind="card" />
                  </component>
                </template>
              </OrganismsEntitiesPlaceCollectionList>

              <p v-else>
                {{ query ? 'No places match your search.' : 'No places found.' }}
              </p>
            </ClientOnly>
