<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UButton
        to="/console/kitchen/dishes"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        Back to dishes
      </UButton>

      <UButton
        v-if="dish && canWrite"
        color="error"
        variant="soft"
        icon="i-lucide-trash-2"
        size="sm"
        :loading="deleting"
        @click="deleteSelectedDish"
      >
        Delete
      </UButton>
    </div>

    <form
      v-if="dish"
      class="space-y-6"
      @submit.prevent="saveDish"
    >
      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Dish</div>
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

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Semantic links</div>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Recipe ids">
            <UTextarea
              v-model="form.recipeIds"
              placeholder="tomato-sauce, pizza-dough"
              :disabled="!canWrite"
              :rows="4"
            />
          </UFormField>

          <UFormField label="Ingredient ids">
            <UTextarea
              v-model="form.ingredientIds"
              placeholder="mozzarella, oregano"
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
          Save dish
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
      :title="pending ? 'Loading dish' : 'Dish not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen dish.'
          : `No dish was found for ${dishId || 'this route'}.`
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
        title="Kitchen dish detail"
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
import { useKitchenConsoleDish } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDish'
import { useDishDelete } from '../../../../../composables/fireux/firestore/dish/mutations/useDishDelete'
import { useDishUpdate } from '../../../../../composables/fireux/firestore/dish/mutations/useDishUpdate'
import {
  normalizeDishStringArray,
  normalizeDishTranslatedText,
  type Dish,
} from '../../../../../models/dish.model'

const {
  dish,
  dishId,
  kitchenId,
  rootCollection,
  databaseId,
  menuUsage,
  pending,
  canWrite,
  debug,
} = useKitchenConsoleDish()

const toast = useToastify()
const { updateDish } = useDishUpdate({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const { deleteDish } = useDishDelete({
  kitchenCollectionPath: rootCollection,
  databaseId,
})

const isDev = import.meta.dev
const saving = ref(false)
const deleting = ref(false)
const saveMessage = ref('')
const originalSignature = ref('')

const form = reactive({
  name: '',
  description: '',
  recipeIds: '',
  ingredientIds: '',
})

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) =>
  normalizeString(value).replace(/_/g, '-')
const parseIds = (value: string) =>
  normalizeDishStringArray(value.split(/[\n,]/g))
const idsToText = (value: unknown) =>
  normalizeDishStringArray(value).join('\n')

const buildSignature = () =>
  JSON.stringify({
    name: normalizeString(form.name),
    description: normalizeString(form.description),
    recipe_ids: parseIds(form.recipeIds),
    ingredient_ids: parseIds(form.ingredientIds),
  })

const isDirty = computed(() => buildSignature() !== originalSignature.value)

const resetForm = (source: Dish | null) => {
  saveMessage.value = ''

  form.name = normalizeString(source?.name)
  form.description = normalizeString(source?.description)
  form.recipeIds = idsToText(source?.recipe_ids)
  form.ingredientIds = idsToText(source?.ingredient_ids)
  originalSignature.value = buildSignature()
}

watch(dish, (next) => resetForm(next), { immediate: true })

const saveDish = async () => {
  if (!canWrite.value || !dish.value || saving.value) return

  const name = normalizeString(form.name)
  if (!name) {
    toast.add({
      title: 'Dish name is required',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    return
  }

  saving.value = true
  saveMessage.value = ''

  try {
    const sourceLanguage =
      normalizeLanguageCode(dish.value.source_language) || 'en'
    const names = normalizeDishTranslatedText(dish.value.names)
    const descriptions = normalizeDishTranslatedText(dish.value.descriptions)
    names[sourceLanguage] = name

    const description = normalizeString(form.description)
    if (description) {
      descriptions[sourceLanguage] = description
    } else {
      delete descriptions[sourceLanguage]
    }

    await updateDish(
      dishId.value,
      {
        name,
        description,
        source_language: sourceLanguage,
        names,
        descriptions,
        recipe_ids: parseIds(form.recipeIds),
        ingredient_ids: parseIds(form.ingredientIds),
      },
      { kitchenId: kitchenId.value }
    )
    originalSignature.value = buildSignature()
    saveMessage.value = 'Saved.'
    toast.add({ title: 'Dish saved', icon: 'i-heroicons-check-circle' })
  } catch (error) {
    const message = String((error as any)?.message || error || 'Failed to save dish')
    toast.add({
      title: 'Dish save failed',
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    saving.value = false
  }
}

const deleteSelectedDish = async () => {
  if (!canWrite.value || !dish.value || deleting.value) return

  const title = normalizeString(dish.value.name)
  const usageCount = menuUsage.value.length
  const usageNote = usageCount
    ? `\n\n${usageCount} menu item${usageCount === 1 ? '' : 's'} reference this dish. This delete will not cascade.`
    : ''
  const ok = window.confirm(`Delete dish "${title}"?\n\nThis will only delete the dish document.${usageNote}`)
  if (!ok) return

  deleting.value = true

  try {
    await deleteDish(dishId.value, { kitchenId: kitchenId.value })
    toast.add({ title: 'Dish deleted', icon: 'i-heroicons-check-circle' })
    await navigateTo('/console/kitchen/dishes')
  } catch (error) {
    const message = String((error as any)?.message || error || 'Failed to delete dish')
    toast.add({
      title: 'Dish delete failed',
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    deleting.value = false
  }
}
</script>
