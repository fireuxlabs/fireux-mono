<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold text-highlighted">
          Select Ingredient
        </div>
        <p class="text-xs text-dimmed">
          Add an existing active root Ingredient to this Kitchen.
        </p>
      </div>
    </template>

    <div class="space-y-3">
      <UInput
        v-model="query"
        placeholder="Search names or aliases"
        icon="i-lucide-search"
        :disabled="
          submitting ||
          libraryPending ||
          Boolean(libraryError) ||
          !canAddIngredient
        "
      />

      <p v-if="libraryPending" class="text-sm text-dimmed">
        Loading Ingredient library...
      </p>

      <UAlert
        v-else-if="libraryError"
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Ingredient library unavailable"
        description="The shared Ingredient world could not be loaded. Try again before selecting an Ingredient."
      />

      <div v-else-if="candidates.length" class="grid gap-2 sm:grid-cols-2">
        <UButton
          v-for="ingredient in candidates"
          :key="ingredient.id"
          color="neutral"
          variant="soft"
          class="justify-start"
          :loading="submitting && selectedId === ingredient.id"
          :disabled="submitting"
          @click="handleSelect(ingredient.id)"
        >
          <UAvatar
            :src="ingredient.image_url || undefined"
            icon="i-lucide-carrot"
            size="xs"
          />
          <span class="min-w-0 text-left">
            <span class="block truncate">{{ ingredient.name }}</span>
            <span class="block truncate text-xs font-normal text-dimmed">
              {{ ingredientCategoryLabel(ingredient.category) }}
            </span>
          </span>
        </UButton>
      </div>

      <p v-else class="text-sm text-dimmed">
        {{
          query
            ? 'No unselected Ingredients match this search.'
            : 'Every active Ingredient is already selected.'
        }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { useKitchenConsoleIngredients } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/useKitchenConsoleIngredients'
import { useKitchenIngredientSelection } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/mutations/useKitchenIngredientSelection'
import { useIngredientCollection } from '../../../../../composables/fireux/firestore/ingredient/fetch/useIngredientCollection'
import { ingredientCategoryLabel } from '../../../../../models/ingredient-taxonomy'
import type { PublicIngredient } from '../../../../../models/ingredient-public.model'

const {
  kitchenId,
  rootCollection,
  canWrite,
  ingredients: selectedIngredients,
} = useKitchenConsoleIngredients()
const {
  ingredients: library,
  pending: libraryPending,
  error: libraryError,
} = useIngredientCollection()
const { selectIngredient } = useKitchenIngredientSelection()
const toast = useToastify()

const query = ref('')
const selectedId = ref('')
const submitting = ref(false)
const clean = (value: unknown) => String(value ?? '').trim()
const canAddIngredient = computed(
  () =>
    canWrite.value &&
    Boolean(clean(kitchenId.value) && clean(rootCollection.value))
)
const selectedIds = computed(
  () =>
    new Set(
      selectedIngredients.value
        .map((ingredient) => clean(ingredient.ingredient_id || ingredient.id))
        .filter(Boolean)
    )
)
const candidates = computed<PublicIngredient[]>(() => {
  const needle = clean(query.value).toLocaleLowerCase()
  return (library.value ?? [])
    .filter(
      (ingredient: PublicIngredient) => !selectedIds.value.has(ingredient.id)
    )
    .filter((ingredient: PublicIngredient) => {
      if (!needle) return true
      return [ingredient.name, ingredient.id, ...ingredient.aliases].some(
        (value) => clean(value).toLocaleLowerCase().includes(needle)
      )
    })
    .slice(0, 12)
})

async function handleSelect(ingredientId: string) {
  if (!canAddIngredient.value || submitting.value) return
  selectedId.value = ingredientId
  submitting.value = true
  try {
    await selectIngredient(clean(kitchenId.value), ingredientId, {
      kitchenCollectionPath: clean(rootCollection.value),
    })
    toast.success('Ingredient added')
    query.value = ''
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Failed to add Ingredient'
    )
  } finally {
    submitting.value = false
    selectedId.value = ''
  }
}
</script>
