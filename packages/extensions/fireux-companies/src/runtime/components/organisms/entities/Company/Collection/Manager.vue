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

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Companies (JSON)'"
        :data="debugPayload"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Company } from '../../../../../models/objects/company.model';
import { useCompanyInterface } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface';

const props = defineProps<{ collection?: Company[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = useCompanyInterface()
const cards = computed(() =>
  collection.value
    .map((company) => makeCard(company as any))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalCompanies: collection.value.length,
  companies: collection.value,
}))

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('cell')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

</script>
