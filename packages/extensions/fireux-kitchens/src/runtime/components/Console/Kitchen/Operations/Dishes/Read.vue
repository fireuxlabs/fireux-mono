<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Dishes</h2>
            <p>Browse dishes for the selected kitchen.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              size="sm"
              placeholder="Search dishes"
              class="w-64 max-w-full"
            />
            <UBadge variant="soft">{{ visibleCards.length }} / {{ cards.length }}</UBadge>
          </div>
        </div>
      </template>

      <div v-if="visibleCards.length" class="grid gap-3 xl:grid-cols-2">
        <ConsoleKitchenOperationsDishesCardsCell
          v-for="card in visibleCards"
          :key="card.id"
          v-bind="card"
          :link="true"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No dishes found.
      </p>
    </UCard>

    <DevJson
      title="Kitchen dishes"
      context="Kitchen dishes console · /console/kitchen/dishes"
      :data="dishDebug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDishInterface } from '../../../../../composables/fireux/firestore/dish/useDish'
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes'

const {
  dishes,
  debug,
} = useKitchenConsoleDishes()
const { cell } = useDishInterface()
const search = ref('')
const text = (value: unknown) => String(value ?? '').trim().toLowerCase()
const cards = computed(() =>
  dishes.value
    .map((dish) => cell(dish))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
const visibleCards = computed(() => {
  const query = text(search.value)
  if (!query) return cards.value

  return cards.value.filter((card) =>
    [card.title, card.subtitle, card.description, card.id]
      .some((value) => text(value).includes(query))
  )
})
const dishDebug = computed(() => ({
  objects: {
    dishes: dishes.value.map((dish) => ({
      id: dish.id,
      name: dish.name,
      hasDescription: Boolean(String(dish.description || '').trim()),
    })),
  },
  derived: {
    ...debug.value,
    visibleCount: visibleCards.value.length,
    search: search.value,
  },
}))
</script>
