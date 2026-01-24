<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
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

    <p v-else class="section__empty">
      {{ query ? 'No users match your search.' : 'No users found.' }}
    </p>

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Users (JSON)'"
        :data="debugPayload"
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
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalUsers: collection.value.length,
  users: collection.value,
}))
</script>
