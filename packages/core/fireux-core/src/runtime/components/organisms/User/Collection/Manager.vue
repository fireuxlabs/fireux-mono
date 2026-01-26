<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Users</div>
          <p>{{ scopeCopy }}</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search users…"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <ClientOnly>
      <OrganismsUserCollectionList
        v-if="cardsFiltered.length"
        :cards="cardsFiltered"
        :variant="variant"
      >
        <template #pill="{ card }">
          <NuxtLink :to="card.to">
            <OrganismsUserCardsPill v-bind="card" />
          </NuxtLink>
        </template>
        <template #cell="{ card }">
          <NuxtLink :to="card.to">
            <OrganismsUserCardsCell v-bind="card" />
          </NuxtLink>
        </template>
      </OrganismsUserCollectionList>

      <p v-else>
        {{ query ? 'No users match your search.' : 'No users found.' }}
      </p>
    </ClientOnly>

    <div v-if="isDev">
      <DevJson
        :title="'Users (JSON)'"
        context="collection manager · users"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserInterface } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface';
import { useCollectionSearch } from '../../../../composables/shared/useCollectionSearch';
import type { User } from '../../../../models/core/user.model';

const props = defineProps<{ collection?: User[] }>()

const scopeCopy = computed(() => 'Browse users available to this runtime.')

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useUserInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<User, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (user) => searchText(user),
  makeCard: (user) => makeCard(user),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
