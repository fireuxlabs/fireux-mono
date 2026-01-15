<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Users</h2>
          <p class="text-xs text-gray-500">
            {{ scopeCopy }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search users…"
            class="w-44"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsUserCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="fx-section__empty">
      {{ query ? 'No users match your search.' : 'No users found.' }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface';
import { useCollectionSearch } from '../../../../composables/shared/useCollectionSearch';

const props = defineProps<{ cards: UserCard.Card[]; total?: number }>()

const scopeCopy = computed(() => 'Browse users available to this runtime.')

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<UserCard.Card, UserCard.Card>({
  items: computed(() => props.cards ?? []),
  searchText: (card) => `${card.displayName} ${card.handle ?? ''} ${card.id ?? ''}`.toLowerCase(),
  makeCard: (card) => card,
})

const totalCount = computed(() => props.total ?? props.cards.length)
</script>
