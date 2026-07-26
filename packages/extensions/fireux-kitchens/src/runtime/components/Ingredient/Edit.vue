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
          <MoleculesFormsFirestoreImagePicker
            :src="ingredient.image_url || ''"
            :alt="ingredient.name || 'Ingredient'"
            :initials="imageInitials"
            :update-function="handleImageUpload"
          />
          <p v-if="imageUploading" class="text-xs text-muted">
            Uploading image...
          </p>
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

        <UFormField label="Kind" required>
          <USelect v-model="form.kind" :items="INGREDIENT_KIND_OPTIONS" />
        </UFormField>
      </div>

      <UFormField label="Aliases" hint="Comma-separated synonyms only">
        <UInput v-model="form.aliases" placeholder="e.g. Rucola, Arugula" />
      </UFormField>

      <UFormField label="Parent Ingredient ID">
        <UInput
          v-model="form.parent_ingredient_id"
          placeholder="Optional active Ingredient ID"
        />
      </UFormField>

      <div class="grid gap-3 sm:grid-cols-2">
        <UFormField label="Lifecycle" required>
          <USelect v-model="form.status" :items="INGREDIENT_STATUS_OPTIONS" />
        </UFormField>

        <UFormField
          label="Replacement Ingredient ID"
          :required="form.status === 'merged'"
          hint="Required only when merged"
        >
          <UInput
            v-model="form.replaced_by_ingredient_id"
            :disabled="form.status !== 'merged'"
            placeholder="Active replacement ID"
          />
        </UFormField>
      </div>

      <p class="text-xs text-dimmed">
        Ingredient roots are retired or merged, never hard-deleted, so Kitchen
        and Supplier references cannot be left dangling.
      </p>

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
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, reactive, ref, watchEffect } from 'vue'
import { useIngredient } from '../../composables/fireux/firestore/ingredient/useIngredient'
import {
  INGREDIENT_CATEGORY_OPTIONS,
  INGREDIENT_KIND_OPTIONS,
  INGREDIENT_STATUS_OPTIONS,
  type IngredientCategory,
  type IngredientKind,
  type IngredientStatus,
} from '../../models/ingredient-taxonomy'
import type { IngredientUpdateInput } from '../../models/ingredient.model'
import type { PublicIngredient } from '../../models/ingredient-public.model'

const props = defineProps<{
  ingredientId: string
  ingredient: PublicIngredient
}>()

const { updateIngredient } = useIngredient()
const { uploadImage } = useImageStorage()
const toast = useToastify()

const saving = ref(false)
const imageUploading = ref(false)

const form = reactive<{
  name: string
  aliases: string
  category: IngredientCategory
  kind: IngredientKind
  parent_ingredient_id: string
  status: IngredientStatus
  replaced_by_ingredient_id: string
}>({
  name: '',
  aliases: '',
  category: 'other',
  kind: 'base',
  parent_ingredient_id: '',
  status: 'active',
  replaced_by_ingredient_id: '',
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
    kind: props.ingredient.kind,
    parent_ingredient_id: clean(props.ingredient.parent_ingredient_id),
    status: props.ingredient.status,
    replaced_by_ingredient_id: clean(
      props.ingredient.replaced_by_ingredient_id
    ),
  })
)

const formSnapshot = computed(() =>
  JSON.stringify({
    name: clean(form.name),
    aliases: aliasList(form.aliases),
    category: form.category,
    kind: form.kind,
    parent_ingredient_id: clean(form.parent_ingredient_id),
    status: form.status,
    replaced_by_ingredient_id:
      form.status === 'merged' ? clean(form.replaced_by_ingredient_id) : '',
  })
)

const resetForm = () => {
  form.name = props.ingredient.name
  form.aliases = (props.ingredient.aliases ?? []).join(', ')
  form.category = props.ingredient.category
  form.kind = props.ingredient.kind
  form.parent_ingredient_id = props.ingredient.parent_ingredient_id ?? ''
  form.status = props.ingredient.status
  form.replaced_by_ingredient_id =
    props.ingredient.replaced_by_ingredient_id ?? ''
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
    await updateIngredient(props.ingredientId, { image_url: url })
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
      kind: form.kind,
      parent_ingredient_id: clean(form.parent_ingredient_id),
      status: form.status,
      replaced_by_ingredient_id:
        form.status === 'merged' ? clean(form.replaced_by_ingredient_id) : '',
    }
    await updateIngredient(props.ingredientId, patch)
    toast.success('Ingredient updated')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update Ingredient'))
  } finally {
    saving.value = false
  }
}
</script>
