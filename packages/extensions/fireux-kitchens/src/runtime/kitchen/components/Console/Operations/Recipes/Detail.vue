<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UButton
        to="/console/kitchen/recipes"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        Back to recipes
      </UButton>

      <UButton
        v-if="recipe && canWrite"
        color="error"
        variant="soft"
        icon="i-lucide-trash-2"
        size="sm"
        :loading="deleting"
        @click="deleteSelectedRecipe"
      >
        Delete
      </UButton>
    </div>

    <form
      v-if="recipe"
      class="space-y-6"
      @submit.prevent="saveRecipe"
    >
      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Recipe</div>
          </div>
        </template>

        <div class="space-y-4">
          <UFormField label="Name">
            <UInput
              v-model="form.name"
              :disabled="!canWrite"
            />
          </UFormField>

          <UFormField label="Description">
            <UTextarea
              v-model="form.description"
              :disabled="!canWrite"
              :rows="4"
            />
          </UFormField>
        </div>
      </UCard>

      <div
        v-if="canWrite"
        class="flex flex-wrap items-center gap-3"
      >
        <UButton
          type="submit"
          icon="i-lucide-save"
          :loading="saving"
          :disabled="!isDirty || saving"
        >
          Save recipe
        </UButton>

        <p
          v-if="saveMessage"
          class="text-sm text-dimmed"
        >
          {{ saveMessage }}
        </p>
      </div>
    </form>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading recipe' : 'Recipe not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen recipe.'
          : `No recipe was found for ${recipeId || 'this route'}.`
      "
    />

    <details class="rounded-lg border border-default bg-default p-4">
      <summary class="cursor-pointer text-sm font-medium text-highlighted">
        Debug
      </summary>

      <DevDebugPanel
        title="Kitchen recipe detail"
        scope="console"
      object-origin="fetched"
      :objects="{ recipe, dishUsage }"
      :derived="debug"
        class="mt-4"
      />
    </details>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, reactive, ref, watch } from 'vue'
import { useKitchenConsoleRecipe } from '../../../../composables/console/operations/Recipes/useKitchenConsoleRecipe'
import { useRecipeDelete } from '../../../../composables/firestore/recipe/mutations/useRecipeDelete'
import { useRecipeUpdate } from '../../../../composables/firestore/recipe/mutations/useRecipeUpdate'
import {
  normalizeTranslatedText,
  type Recipe,
} from '../../../../models/recipe.model.ts'

const {
  recipe,
  recipeId,
  kitchenId,
  rootCollection,
  databaseId,
  dishUsage,
  pending,
  canWrite,
  debug,
} = useKitchenConsoleRecipe()

const toast = useToastify()
const { updateRecipe } = useRecipeUpdate({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const { deleteRecipe } = useRecipeDelete({
  kitchenCollectionPath: rootCollection,
  databaseId,
})

const saving = ref(false)
const deleting = ref(false)
const saveMessage = ref('')
const originalSignature = ref('')

const form = reactive({
  name: '',
  description: '',
})

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) =>
  normalizeString(value).replace(/_/g, '-')

const buildSignature = () =>
  JSON.stringify({
    name: normalizeString(form.name),
    description: normalizeString(form.description),
  })

const isDirty = computed(() => buildSignature() !== originalSignature.value)

const resetForm = (source: Recipe | null) => {
  saveMessage.value = ''

  form.name = normalizeString(source?.name)
  form.description = normalizeString(source?.description)
  originalSignature.value = buildSignature()
}

watch(recipe, (next: Recipe | null) => resetForm(next), { immediate: true })

const saveRecipe = async () => {
  if (!canWrite.value || !recipe.value || saving.value) return

  const name = normalizeString(form.name)
  if (!name) {
    toast.add({
      title: 'Recipe name is required',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    return
  }

  saving.value = true
  saveMessage.value = ''

  try {
    const sourceLanguage =
      normalizeLanguageCode(recipe.value.source_language) || 'en'
    const names = normalizeTranslatedText(recipe.value.names)
    const descriptions = normalizeTranslatedText(recipe.value.descriptions)
    names[sourceLanguage] = name

    const description = normalizeString(form.description)
    if (description) {
      descriptions[sourceLanguage] = description
    } else {
      delete descriptions[sourceLanguage]
    }

    await updateRecipe(
      recipeId.value,
      {
        name,
        description,
        source_language: sourceLanguage,
        names,
        descriptions,
      },
      { kitchenId: kitchenId.value }
    )
    originalSignature.value = buildSignature()
    saveMessage.value = 'Saved.'
    toast.add({ title: 'Recipe saved', icon: 'i-heroicons-check-circle' })
  } catch (error) {
    const message = String((error as any)?.message || error || 'Failed to save recipe')
    toast.add({
      title: 'Recipe save failed',
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    saving.value = false
  }
}

const deleteSelectedRecipe = async () => {
  if (!canWrite.value || !recipe.value || deleting.value) return

  const title = normalizeString(recipe.value.name || recipeId.value)
  const usageCount = dishUsage.value.length
  const usageNote = usageCount
    ? `\n\n${usageCount} dish record${usageCount === 1 ? '' : 's'} reference this recipe. This delete will not cascade.`
    : ''
  const ok = window.confirm(`Delete recipe "${title}"?\n\nThis will only delete the recipe document.${usageNote}`)
  if (!ok) return

  deleting.value = true

  try {
    await deleteRecipe(recipeId.value, { kitchenId: kitchenId.value })
    toast.add({ title: 'Recipe deleted', icon: 'i-heroicons-check-circle' })
    await navigateTo('/console/kitchen/recipes')
  } catch (error) {
    const message = String((error as any)?.message || error || 'Failed to delete recipe')
    toast.add({
      title: 'Recipe delete failed',
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    deleting.value = false
  }
}
</script>
