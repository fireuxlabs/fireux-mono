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
            <p class="console-card-header__description">
              Simple recipe card setup for the selected kitchen.
            </p>
          </div>
        </template>

        <div class="space-y-4">
          <UFormField label="Name">
            <UInput
              v-model="form.name"
              :disabled="!canWrite"
              placeholder="Tomato sauce"
            />
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Slug">
              <UInput
                v-model="form.slug"
                disabled
              />
            </UFormField>

            <UFormField label="Type">
              <select
                v-model="form.recipe_type"
                :disabled="!canWrite"
                class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="prep">Prep</option>
                <option value="service">Service</option>
              </select>
            </UFormField>
          </div>

          <UFormField label="Notes">
            <UTextarea
              v-model="form.notes"
              :disabled="!canWrite"
              :rows="3"
              placeholder="Internal notes"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Language Names</div>
            <p class="console-card-header__description">
              Localised names and descriptions for this recipe card.
            </p>
          </div>
        </template>

        <div class="space-y-4">
          <UFormField label="Default locale">
            <select
              v-model="form.default_locale"
              :disabled="!canWrite"
              class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option
                v-for="locale in localeFields"
                :key="locale.code"
                :value="locale.code"
              >
                {{ locale.label }}
              </option>
            </select>
          </UFormField>

          <div class="grid gap-4 lg:grid-cols-2">
            <section
              v-for="locale in localeFields"
              :key="locale.code"
              class="rounded-lg border border-default bg-elevated/30 p-4"
            >
              <div class="mb-3 text-sm font-semibold text-highlighted">
                {{ locale.label }}
              </div>

              <div class="space-y-3">
                <UFormField label="Name">
                  <UInput
                    v-model="form.names[locale.code]"
                    :disabled="!canWrite"
                    :placeholder="locale.namePlaceholder"
                  />
                </UFormField>

                <UFormField label="Description">
                  <UTextarea
                    v-model="form.descriptions[locale.code]"
                    :disabled="!canWrite"
                    :rows="2"
                    placeholder="Optional"
                  />
                </UFormField>
              </div>
            </section>
          </div>
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

    <details
      v-if="isDev"
      class="rounded-lg border border-default bg-default p-4"
    >
      <summary class="cursor-pointer text-sm font-medium text-highlighted">
        Debug
      </summary>

      <DevFireuxDebugPanel
        title="Kitchen recipe detail"
        scope="console"
        :data="debug"
        class="mt-4"
      />
    </details>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, reactive, ref, watch } from 'vue'
import { useKitchenConsoleRecipe } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleRecipe'
import { useRecipeDelete } from '../../../../../composables/fireux/firestore/runtime-kitchen/recipe/mutations/useRecipeDelete'
import { useRecipeUpdate } from '../../../../../composables/fireux/firestore/runtime-kitchen/recipe/mutations/useRecipeUpdate'
import type {
  LocaleCode,
  LocalizedText,
  Recipe,
  RecipeType,
} from '../../../../../models/recipe.model'

type LocaleForm = Record<LocaleCode, string>

const localeFields = [
  { code: 'it', label: 'Italian', namePlaceholder: 'salsa di pomodoro' },
  { code: 'de', label: 'German', namePlaceholder: 'Tomatensauce' },
  { code: 'en', label: 'English', namePlaceholder: 'tomato sauce' },
  { code: 'fr', label: 'French', namePlaceholder: 'sauce tomate' },
] as const

const localeCodes = localeFields.map((locale) => locale.code)
const recipeTypes: RecipeType[] = ['prep', 'service']

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

const isDev = import.meta.dev
const saving = ref(false)
const deleting = ref(false)
const saveMessage = ref('')
const originalSignature = ref('')

const blankLocalizedText = (): LocaleForm => ({
  it: '',
  de: '',
  en: '',
  fr: '',
})

const form = reactive({
  name: '',
  slug: '',
  recipe_type: 'prep' as RecipeType,
  default_locale: 'en' as LocaleCode,
  notes: '',
  names: blankLocalizedText(),
  descriptions: blankLocalizedText(),
})

const normalizeString = (value: unknown) => String(value ?? '').trim()

const normalizeLocale = (value: unknown): LocaleCode => {
  const locale = normalizeString(value).replace(/_/g, '-').toLowerCase()
  return localeCodes.includes(locale as LocaleCode) ? (locale as LocaleCode) : 'en'
}

const normalizeRecipeType = (value: unknown): RecipeType => {
  const type = normalizeString(value)
  return recipeTypes.includes(type as RecipeType) ? (type as RecipeType) : 'prep'
}

const toLocaleForm = (
  value: unknown,
  defaultLocale: LocaleCode = 'en'
): LocaleForm => {
  const next = blankLocalizedText()

  if (typeof value === 'string') {
    next[defaultLocale] = normalizeString(value)
    return next
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) return next

  for (const locale of localeCodes) {
    next[locale] = normalizeString((value as Record<string, unknown>)[locale])
  }

  return next
}

const toLocalizedText = (value: LocaleForm): LocalizedText => ({
  it: normalizeString(value.it),
  de: normalizeString(value.de),
  en: normalizeString(value.en),
  fr: normalizeString(value.fr),
})

const buildSignature = () =>
  JSON.stringify({
    name: normalizeString(form.name),
    recipe_type: form.recipe_type,
    default_locale: form.default_locale,
    notes: normalizeString(form.notes),
    names: toLocalizedText(form.names),
    descriptions: toLocalizedText(form.descriptions),
  })

const isDirty = computed(() => buildSignature() !== originalSignature.value)

const resetForm = (source: Recipe | null) => {
  saveMessage.value = ''

  if (!source) {
    form.name = ''
    form.slug = ''
    form.recipe_type = 'prep'
    form.default_locale = 'en'
    form.notes = ''
    form.names = blankLocalizedText()
    form.descriptions = blankLocalizedText()
    originalSignature.value = buildSignature()
    return
  }

  const defaultLocale = normalizeLocale(source.default_locale)
  form.name = normalizeString(source.name)
  form.slug = normalizeString(source.slug || source.id)
  form.recipe_type = normalizeRecipeType(source.recipe_type)
  form.default_locale = defaultLocale
  form.notes = normalizeString(source.notes)
  form.names = toLocaleForm(source.names, defaultLocale)
  form.descriptions = toLocaleForm(source.descriptions ?? source.description, defaultLocale)
  originalSignature.value = buildSignature()
}

watch(recipe, (next) => resetForm(next), { immediate: true })

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
    await updateRecipe(
      recipeId.value,
      {
        name,
        recipe_type: form.recipe_type,
        default_locale: form.default_locale,
        notes: normalizeString(form.notes),
        names: toLocalizedText(form.names),
        descriptions: toLocalizedText(form.descriptions),
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
