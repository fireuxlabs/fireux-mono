<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Users</div>
          <p class="text-xs text-dimmed">{{ scopeCopy }}</p>
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

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No users match your search.' : 'No users found.' }}
    </p>

    <div v-if="isDev" class="pt-3">
      <DevJson
        :title="'Users (JSON)'"
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
