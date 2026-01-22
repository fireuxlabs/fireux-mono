<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Products</div>

        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">
      No products yet.
    </div>

    <div v-else>
      <div
        v-if="variant === 'pill'"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <ProductCardsPill
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="Boolean(card.to)"
          class="block"
        />
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <ProductCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="Boolean(card.to)"
          class="block"
        />
      </div>
    </div>

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Products (JSON)'"
        :data="debugPayload"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProductInterface } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface';
import type { FirebaseProduct } from '../../../../../models/objects/product.model';

const props = defineProps<{ collection?: FirebaseProduct[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = useProductInterface()
type ProductCardShape = NonNullable<ReturnType<typeof makeCard>>
const cards = computed(() =>
  collection.value
    .map((product) => makeCard(product))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalProducts: collection.value.length,
  products: collection.value,
}))

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('cell')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

</script>

