<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Demo surfaces for ingredients
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Demo surfaces for ingredients.
          </p>
        </div>
      </div>
    </template>

    <div v-if="pillItems.length" class="flex flex-wrap gap-2">
      <IngredientCardsPill
        v-for="item in pillItems"
        :key="item.ingredient.id"
        v-bind="item.card"
        action
        @action="selectIngredient(item.ingredient)"
      />
    </div>

    <div v-if="pillItems.length" class="space-y-4">
      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Pill</div>
        <IngredientCardsPill
          v-if="demoPill"
          v-bind="demoPill"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Cell</div>
        <IngredientCardsCell
          v-if="demoCell"
          v-bind="demoCell"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Preview</div>
        <IngredientCardsPreview
          v-if="demoPreview"
          v-bind="demoPreview"
        />
      </div>

      <div class="space-y-2">
        <div class="text-xs font-medium text-dimmed">Profile</div>
        <IngredientCardsProfile
          v-if="demoProfile"
          :model="demoProfile"
        />
      </div>
    </div>

    <UCard v-else variant="subtle">
      <p class="text-sm text-dimmed">
        No ingredient samples available yet. Add entries to `demo/ingredient.demo.ts`.
      </p>
    </UCard>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { demoIngredientList } from '../../../../../../../../demo/ingredient.demo'
import { useIngredientInterface } from '../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'
import type { Ingredient } from '../../../models/ingredient.model'
import IngredientCardsCell from '../../Organisms/Ingredient/Cards/Cell.vue'
import IngredientCardsPill from '../../Organisms/Ingredient/Cards/Pill.vue'
import IngredientCardsPreview from '../../Organisms/Ingredient/Cards/Preview.vue'
import IngredientCardsProfile from '../../Organisms/Ingredient/Cards/Profile.vue'

defineOptions({ name: 'DevIngredientDemo' })

const emit = defineEmits<{
  (event: 'ready', ingredient: Ingredient): void
}>()

const { pill, cell, preview, profile } = useIngredientInterface()

const surfaceIngredients = computed<Ingredient[]>(() => {
  return demoIngredientList ?? []
})

const selectedId = ref('')

watch(
  surfaceIngredients,
  (next) => {
    if (!next.length) {
      selectedId.value = ''
      return
    }
    if (!selectedId.value || !next.some((item) => String(item.id) === selectedId.value)) {
      selectedId.value = String(next[0]?.id ?? '')
    }
  },
  { immediate: true }
)

const selectedIngredient = computed(() => {
  const selected = surfaceIngredients.value.find(
    (ingredient) => String(ingredient.id) === selectedId.value
  )
  return (selected ?? surfaceIngredients.value[0] ?? null) as Ingredient | null
})

const selectIngredient = (ingredient: Ingredient) => {
  selectedId.value = String(ingredient.id)
}

const pillItems = computed(() =>
  surfaceIngredients.value
    .map((ingredient) => {
      const card = pill(ingredient)
      if (!card) return null
      return { ingredient, card }
    })
    .filter(
      (
        item
      ): item is { ingredient: Ingredient; card: NonNullable<ReturnType<typeof pill>> } =>
        Boolean(item)
    )
)

const demoPill = computed(() => pill(selectedIngredient.value))
const demoCell = computed(() => cell(selectedIngredient.value))
const demoPreview = computed(() => preview(selectedIngredient.value))
const demoProfile = computed(() => profile(selectedIngredient.value))

onMounted(() => {
  if (selectedIngredient.value) emit('ready', selectedIngredient.value)
})

watch(selectedIngredient, (next) => {
  if (next) emit('ready', next)
})
</script>
