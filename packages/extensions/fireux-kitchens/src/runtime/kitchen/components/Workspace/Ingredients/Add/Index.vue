<template>
  <div class="space-y-5">
    <div class="space-y-3">
      <UInput
        v-model="query"
        placeholder="Search the ingredient catalogue…"
        aria-label="Find ingredients to add"
        size="lg"
        class="w-full"
        icon="i-lucide-search"
        :disabled="
          submitting ||
          libraryPending ||
          Boolean(libraryError) ||
          !canAddIngredient
        "
      />

      <p v-if="libraryPending" class="text-sm text-dimmed">
        Loading ingredients…
      </p>

      <UAlert
        v-else-if="libraryError"
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Ingredient library unavailable"
        description="The ingredient catalogue could not be loaded. Please try again."
      />

      <div v-else-if="candidates.length" class="grid gap-2">
        <UButton
          v-for="ingredient in candidates"
          :key="ingredient.id"
          color="neutral"
          variant="soft"
          class="justify-start gap-3 rounded-xl p-3"
          :loading="submitting && selectedId === ingredient.id"
          :disabled="submitting || !canAddIngredient"
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
          <UIcon name="i-lucide-plus" class="ml-auto size-4 shrink-0" />
        </UButton>
      </div>

      <p v-else class="text-sm text-dimmed">
        {{
          query
            ? 'No ingredients available to add match your search.'
            : 'All ingredients in the catalogue are already in your kitchen.'
        }}
      </p>
      <p v-if="candidates.length === 24" class="text-xs text-dimmed">
        Showing the first 24 results. Search to narrow the list.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, ref, watch } from 'vue'
import { useKitchenWorkspaceIngredients } from '../../../../composables/workspace/ingredients/useKitchenWorkspaceIngredients'
import { useKitchenIngredientSelection } from '../../../../composables/workspace/ingredients/useKitchenIngredientSelection'
import { useIngredientCollection } from '../../../../../ingredient/composables/useIngredientCollection'
import { ingredientCategoryLabel } from '../../../../../ingredient/models/ingredient-taxonomy'
import type { Ingredient } from '../../../../../ingredient/utils/ingredient.ts'

const {
  kitchenId,
  rootCollection,
  canWrite,
  ingredients: selectedIngredients,
} = useKitchenWorkspaceIngredients()
const {
  ingredients: library,
  pending: libraryPending,
  error: libraryError,
} = useIngredientCollection()
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
const candidates = computed<Ingredient[]>(() => {
  const needle = clean(query.value).toLocaleLowerCase()
  return (library.value ?? [])
    .filter((ingredient: Ingredient) => !selectedIds.value.has(ingredient.id))
    .filter((ingredient: Ingredient) => {
      if (!needle) return true
      return [ingredient.name, ingredient.id, ...ingredient.aliases].some(
        (value) => clean(value).toLocaleLowerCase().includes(needle)
      )
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 24)
})

const { selectIngredient, captureIntent, authorityEpoch } =
  useKitchenIngredientSelection([rootCollection, canWrite, query])
watch(
  [authorityEpoch, kitchenId, rootCollection, canWrite, query],
  () => {
    submitting.value = false
    selectedId.value = ''
  },
  { flush: 'sync' }
)
async function handleSelect(ingredientId: string) {
  if (!canAddIngredient.value || submitting.value) return
  const isCurrent = captureIntent()
  selectedId.value = ingredientId
  submitting.value = true
  try {
    await selectIngredient(clean(kitchenId.value), ingredientId, {
      kitchenCollectionPath: clean(rootCollection.value),
    })
    if (!isCurrent()) return
    submitting.value = false
    toast.success('Ingredient added')
    query.value = ''
  } catch (error) {
    if (!isCurrent()) return
    toast.error(
      error instanceof Error ? error.message : 'Failed to add Ingredient'
    )
  } finally {
    if (isCurrent()) {
      submitting.value = false
      selectedId.value = ''
    }
  }
}
</script>
