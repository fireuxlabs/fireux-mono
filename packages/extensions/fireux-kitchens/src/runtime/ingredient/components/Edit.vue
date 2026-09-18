<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Curate Ingredient</div>
        <p class="text-xs text-dimmed">
          Keep one popular canonical name. Aliases are synonyms, not
          translations.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <UFormField label="Image">
        <div class="flex flex-col items-center gap-2">
          <MoleculesFormsEditableImagePicker
            :src="ingredient.image_url || ''"
            :alt="ingredient.name || 'Ingredient'"
            :initials="imageInitials"
            :update="handleImageUpload"
          />
          <p v-if="imageUploading" class="text-xs text-muted">
            Uploading image...
          </p>
          <UButton
            v-if="!ingredient.image_url"
            label="Generate image"
            icon="i-lucide-sparkles"
            variant="soft"
            :loading="generating"
            :disabled="imageUploading"
            @click="generate(ingredientId)"
          />
          <MoleculesStateCard
            v-if="generationError"
            state="error"
            title="Image unavailable"
            :description="generationError"
          />
        </div>
      </UFormField>

      <UFormField label="Name" required>
        <UInput v-model="form.name" placeholder="Ingredient name" />
      </UFormField>

      <div class="grid gap-3 sm:grid-cols-2">
        <UFormField label="Category" required>
          <USelect
            v-model="form.category"
            :items="INGREDIENT_CATEGORY_OPTIONS"
          />
        </UFormField>
      </div>

      <UFormField label="Aliases" hint="Comma-separated synonyms only">
        <UInput v-model="form.aliases" placeholder="e.g. Rucola, Arugula" />
      </UFormField>

      <div class="flex flex-wrap justify-end gap-2">
        <UButton
          variant="ghost"
          :disabled="saving || !isDirty"
          @click="resetForm"
        >
          Reset
        </UButton>
        <UButton
          color="primary"
          :loading="saving"
          :disabled="!isDirty"
          @click="saveChanges"
        >
          Save changes
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, reactive, ref, watchEffect } from 'vue'
import { useIngredientUpdate } from '../composables/firestore/mutations/useIngredientUpdate'
import { useIngredientImageGeneration } from '../composables/useIngredientImageGeneration'
import {
  INGREDIENT_CATEGORY_OPTIONS,
  type IngredientCategory,
} from '../models/ingredient-taxonomy'
import type { Ingredient, IngredientUpdateInput } from '../utils/ingredient.ts'

const props = defineProps<{
  ingredientId: string
  ingredient: Ingredient
}>()

const { updateIngredient } = useIngredientUpdate()
const {
  generate,
  generating,
  error: generationError,
} = useIngredientImageGeneration()
const { uploadImage } = useImageStorage()
const toast = useToastify()

const saving = ref(false)
const imageUploading = ref(false)

const form = reactive<{
  name: string
  aliases: string
  category: IngredientCategory
}>({
  name: '',
  aliases: '',
  category: 'vegetables',
})

const clean = (value: unknown) => String(value ?? '').trim()
const aliasList = (value: string) => [
  ...new Set(
    value
      .split(',')
      .map((alias) => clean(alias))
      .filter(Boolean)
  ),
]

const snapshot = computed(() =>
  JSON.stringify({
    name: clean(props.ingredient.name),
    aliases: [...(props.ingredient.aliases ?? [])],
    category: props.ingredient.category,
  })
)

const formSnapshot = computed(() =>
  JSON.stringify({
    name: clean(form.name),
    aliases: aliasList(form.aliases),
    category: form.category,
  })
)

const resetForm = () => {
  form.name = props.ingredient.name
  form.aliases = (props.ingredient.aliases ?? []).join(', ')
  form.category = props.ingredient.category
}

watchEffect(resetForm)

const isDirty = computed(() => snapshot.value !== formSnapshot.value)

const imageInitials = computed(() => {
  const parts = clean(props.ingredient.name).split(/\s+/).filter(Boolean)
  if (!parts.length) return 'I'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})

const handleImageUpload = async (file: File) => {
  if (!props.ingredientId) return
  imageUploading.value = true
  try {
    const url = await uploadImage(
      `ingredients/${props.ingredientId}/image_url`,
      file
    )
    await updateIngredient({
      ingredientId: props.ingredientId,
      changes: { image_url: url },
    })
    toast.success('Ingredient image updated')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update Ingredient image'))
    throw error
  } finally {
    imageUploading.value = false
  }
}

const saveChanges = async () => {
  if (!props.ingredientId || !isDirty.value || saving.value) return
  saving.value = true
  try {
    const patch: IngredientUpdateInput = {
      name: clean(form.name),
      aliases: aliasList(form.aliases),
      category: form.category,
    }
    await updateIngredient({ ingredientId: props.ingredientId, changes: patch })
    toast.success('Ingredient updated')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update Ingredient'))
  } finally {
    saving.value = false
  }
}
</script>
