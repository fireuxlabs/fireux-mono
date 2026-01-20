<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Companies</div>

        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">
      No companies yet.
    </div>

    <div v-else>
      <div
        v-if="variant === 'pill'"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <template v-for="card in cards" :key="card.id">
          <NuxtLink v-if="card.to" :to="card.to" class="block">
            <CompanyCardsPill v-bind="card" />
          </NuxtLink>
          <div v-else class="block">
            <CompanyCardsPill v-bind="card" />
          </div>
        </template>
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <template v-for="card in cards" :key="card.id">
          <NuxtLink v-if="card.to" :to="card.to" class="block">
            <CompanyCardsCell v-bind="card" />
          </NuxtLink>
          <div v-else class="block">
            <CompanyCardsCell v-bind="card" />
          </div>
        </template>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CompanyCard } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface';

const props = defineProps<{ cards: CompanyCard.Card[] }>()

const cards = computed(() => props.cards ?? [])

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('cell')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

</script>
