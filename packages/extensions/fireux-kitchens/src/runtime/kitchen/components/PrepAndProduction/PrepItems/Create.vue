<template>
  <details class="rounded-xl border border-default p-4">
    <summary class="cursor-pointer text-sm font-medium">
      Create prep item
    </summary>
    <FireStateCard
      v-if="message"
      state="error"
      title="Prep item not created"
      :description="message"
      class="mt-4"
    />
    <fieldset :disabled="disabled || creatingPrep" class="mt-4 grid gap-3">
      <UInput
        v-model="newPrepName"
        placeholder="Name"
        aria-label="New prep item name"
      />
      <USelect
        v-model="newPrepIngredient"
        :items="ingredientOptions"
        placeholder="Source ingredient"
        aria-label="Prep source ingredient"
      />
      <div class="grid grid-cols-2 gap-3">
        <UInput
          v-model="newPrepQuantity"
          type="number"
          min="0.001"
          step="any"
          aria-label="Prep definition quantity"
        />
        <USelect
          v-model="newPrepUnit"
          :items="['g', 'ml', 'each', 'portion']"
          aria-label="Prep definition unit"
        />
      </div>
      <UTextarea
        v-model="newPrepMethod"
        aria-label="Prep definition method"
        placeholder="Preparation method"
      />
      <UButton
        label="Create prep item"
        color="neutral"
        variant="soft"
        :loading="creatingPrep"
        type="button"
        :disabled="disabled || !newPrepName.trim() || creatingPrep"
        @click="createPrep"
      />
    </fieldset>
  </details>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRecipeScope } from '../../../composables/recipe/useRecipeScope'
import { useKitchenPrepItemCreate } from '../../../composables/prep-item/useKitchenPrepItemCreate'
import type { RecipePrepItem } from '../../../models/recipe-preparation'
const props = defineProps<{
  kitchenId: string
  recipeIntent: string
  captureIntent?: () => () => boolean
  ingredientOptions: Array<{ label: string; value: string }>
  disabled: boolean
}>()
const emit = defineEmits<{
  created: [selection: RecipePrepItem]
  busy: [value: boolean]
}>()
const message = ref('')
function setCreating(value: boolean) {
  creatingPrep.value = value
  emit('busy', value)
}
const newPrepName = ref('')
const newPrepIngredient = ref('')
const newPrepQuantity = ref(1)
const newPrepUnit = ref<'g' | 'ml' | 'each' | 'portion'>('each')
const newPrepMethod = ref('')
const creatingPrep = ref(false)
const createPrep = async () => {
  const local = capturePrep()
  const parent = props.captureIntent?.() || (() => true)
  const isCurrent = () => local() && parent()
  const requestedKitchenId = props.kitchenId
  const requestedUnit = newPrepUnit.value
  if (props.disabled || creatingPrep.value || !newPrepName.value.trim()) return
  setCreating(true)
  message.value = ''
  try {
    const requestedQuantity = positiveQuantity(newPrepQuantity.value)
    const result = await createPrepItem(
      {
        name: newPrepName.value,
        inputs: newPrepIngredient.value
          ? [
              {
                ingredient_id: newPrepIngredient.value,
                quantity: requestedQuantity,
                unit: requestedUnit,
                preparation: '',
              },
            ]
          : [],
        yield: {
          quantity: requestedQuantity,
          unit: requestedUnit,
        },
        method: newPrepMethod.value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      },
      { kitchenId: requestedKitchenId },
      { translate: false, sourceLanguage: 'en' }
    )
    if (!isCurrent()) return
    const selection = {
      prep_item_id: result.id,
      quantity: requestedQuantity,
      unit: requestedUnit,
      note: '',
    }
    setCreating(false)
    newPrepName.value = ''
    newPrepIngredient.value = ''
    newPrepMethod.value = ''
    emit('created', selection)
  } catch (error) {
    if (!isCurrent()) return
    message.value =
      error instanceof Error ? error.message : 'Could not create prep item.'
  } finally {
    if (isCurrent()) setCreating(false)
  }
}
const prepDraft = computed(() =>
  JSON.stringify([
    newPrepName.value,
    newPrepIngredient.value,
    newPrepQuantity.value,
    newPrepUnit.value,
    newPrepMethod.value,
  ])
)
const ownerSources = [() => props.kitchenId]
useRecipeScope(ownerSources, () => {
  setCreating(false)
  message.value = ''
  newPrepName.value = ''
  newPrepIngredient.value = ''
  newPrepQuantity.value = 1
  newPrepUnit.value = 'each'
  newPrepMethod.value = ''
})
const draftSources = [...ownerSources, () => props.recipeIntent, prepDraft]
const capturePrep = useRecipeScope(draftSources, () => {
  setCreating(false)
  message.value = ''
})
const { createPrepItem } = useKitchenPrepItemCreate([
  ...draftSources,
  () => props.disabled,
])
const positiveQuantity = (value: unknown) => {
  const text = String(value ?? '').trim(),
    quantity = Number(text)
  if (!text || !Number.isFinite(quantity) || quantity <= 0)
    throw new Error('Enter a positive quantity.')
  return quantity
}
</script>
