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

    <OrganismsEntitiesCompanyCollectionList
      v-else
      :cards="cards"
      :variant="variant"
    />

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
import { useCompanyInterface } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface';
import type { Company } from '../../../../../models/objects/company.model';

const props = defineProps<{ collection?: Company[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = useCompanyInterface()
type CompanyCardShape = NonNullable<ReturnType<typeof makeCard>>
const cards = computed(() =>
  collection.value
    .map((company) => makeCard(company))
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
