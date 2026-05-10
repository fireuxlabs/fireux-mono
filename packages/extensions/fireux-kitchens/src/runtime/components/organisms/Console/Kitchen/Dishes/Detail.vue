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
            <div class="console-card-header__title">Dish Summary</div>
          </div>
        </template>

        <div class="space-y-6">
          <header class="space-y-2">
            <div>
              <h1 class="text-2xl font-semibold text-highlighted">
                {{ dish.name }}
              </h1>
              <p class="text-sm text-muted">id: {{ dish.id }}</p>
            </div>

            <p
              v-if="dish.description"
              class="text-sm text-toned"
            >
              {{ dish.description }}
            </p>

            <p
              v-if="dishIntegrityNote"
              class="text-sm text-warning"
            >
              {{ dishIntegrityNote }}
            </p>
          </header>

          <div class="grid gap-4 md:grid-cols-2">
            <section
              v-for="group in semanticGroups"
              :key="group.key"
              class="space-y-3 rounded-md border border-default p-4"
            >
              <h2 class="text-sm font-semibold text-highlighted">
                {{ group.label }}
              </h2>

              <div
                v-if="group.items.length"
                class="space-y-3"
              >
                <div
                  v-for="item in group.items"
                  :key="item.id"
                >
                  <div class="text-sm font-medium text-highlighted">
                    {{ item.name }}
                  </div>
                  <div class="text-xs text-muted">id: {{ item.id }}</div>
                </div>
              </div>

              <p
                v-else
                class="text-sm text-muted"
              >
                —
              </p>
            </section>
          </div>

          <section class="space-y-3 rounded-md border border-default p-4">
            <h2 class="text-sm font-semibold text-highlighted">
              Menu placements
            </h2>

            <div
              v-if="menuPlacements.length"
              class="space-y-3"
            >
              <div
                v-for="placement in menuPlacements"
                :key="`${placement.menu_id}:${placement.section_id}`"
              >
                <div class="text-sm font-medium text-highlighted">
                  {{ placement.section_id }}
                </div>
                <div class="text-xs text-muted">
                  menu: {{ placement.menu_id }}
                </div>
              </div>
            </div>

            <p
              v-else
              class="text-sm text-muted"
            >
              —
            </p>
          </section>

          <div
            v-if="legacyRecipeIds.length"
            class="space-y-3 rounded-md border border-warning/30 bg-warning/5 p-4"
          >
            <h2 class="text-sm font-semibold text-warning">Legacy recipe_ids</h2>
            <p class="text-sm text-muted">
              Dish semantics now use mise and ingredients. These ids should be cleared from the dish doc.
            </p>
            <ul class="space-y-1 text-sm text-warning">
              <li
                v-for="id in legacyRecipeIds"
                :key="id"
              >
                {{ id }}
              </li>
            </ul>
          </div>

          <div
            v-if="missingGroups.length"
            class="space-y-3 rounded-md border border-error/30 bg-error/5 p-4"
          >
            <h2 class="text-sm font-semibold text-error">Missing references</h2>

            <section
              v-for="group in missingGroups"
              :key="group.key"
              class="space-y-1"
            >
              <h3 class="text-sm font-medium text-error">
                Missing {{ group.label.toLowerCase() }}
              </h3>
              <ul class="space-y-1 text-sm text-error">
                <li
                  v-for="id in group.ids"
                  :key="id"
                >
                  {{ id }}
                </li>
              </ul>
            </section>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Edit</div>
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
          <UFormField label="Mise ids">
            <UTextarea
              v-model="form.miseIds"
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

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen dish object"
      scope="console"
      :data="fireuxDebugData"
      :default-open="true"
    />
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, reactive, ref, watch } from 'vue'
import { useKitchenConsoleDish } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDish'
import { useDishDelete } from '../../../../../composables/fireux/firestore/dish/mutations/useDishDelete'
import { useDishUpdate } from '../../../../../composables/fireux/firestore/dish/mutations/useDishUpdate'
import { useIngredientFetch } from '../../../../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'
import { useKitchenMiseCollection } from '../../../../../composables/fireux/firestore/runtime-kitchen/mise/fetch/useKitchenMiseCollection'
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
const { miseTasks } = useKitchenMiseCollection(kitchenId, {
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const { ingredients } = useIngredientFetch()

const isDev = import.meta.dev
const saving = ref(false)
const deleting = ref(false)
const saveMessage = ref('')
const originalSignature = ref('')

const form = reactive({
  name: '',
  description: '',
  miseIds: '',
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
    mise_ids: parseIds(form.miseIds),
    ingredient_ids: parseIds(form.ingredientIds),
  })

const isDirty = computed(() => buildSignature() !== originalSignature.value)

const resetForm = (source: Dish | null) => {
  saveMessage.value = ''

  form.name = normalizeString(source?.name)
  form.description = normalizeString(source?.description)
  form.miseIds = idsToText(source?.mise_ids)
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
        mise_ids: parseIds(form.miseIds),
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

type ResolvedComponent = {
  id: string
  name: string
}

const sourceName = (source: Record<string, unknown>, languageCode: string) => {
  const names =
    source.names && typeof source.names === 'object' && !Array.isArray(source.names)
      ? (source.names as Record<string, unknown>)
      : {}

  return (
    normalizeString(names[languageCode]) ||
    normalizeString(source?.name) ||
    normalizeString(source?.title) ||
    normalizeString(source?.id)
  )
}
const resolveGroup = (
  ids: string[],
  sources: Record<string, unknown>[],
  languageCode: string
) => {
  const byId = new Map(
    sources
      .map((source) => [normalizeString(source?.id), source] as const)
      .filter(([id]) => Boolean(id))
  )
  const items: ResolvedComponent[] = []
  const missing: string[] = []

  ids.forEach((id) => {
    const source = byId.get(id)
    if (!source) {
      missing.push(id)
      return
    }

    items.push({
      id,
      name: sourceName(source, languageCode) || id,
    })
  })

  return { items, missing }
}

const displayLanguage = computed(() =>
  normalizeLanguageCode(dish.value?.source_language) || 'en'
)
const miseResolution = computed(() =>
  resolveGroup(
    normalizeDishStringArray(dish.value?.mise_ids),
    miseTasks.value as Record<string, unknown>[],
    displayLanguage.value
  )
)
const ingredientResolution = computed(() =>
  resolveGroup(
    normalizeDishStringArray(dish.value?.ingredient_ids),
    (ingredients.value || []) as Record<string, unknown>[],
    displayLanguage.value
  )
)
const semanticGroups = computed(() => [
  {
    key: 'mise',
    label: 'Mise',
    items: miseResolution.value.items,
  },
  {
    key: 'ingredients',
    label: 'Ingredients',
    items: ingredientResolution.value.items,
  },
])
const missingGroups = computed(() =>
  [
    {
      key: 'mise',
      label: 'Mise',
      ids: miseResolution.value.missing,
    },
    {
      key: 'ingredients',
      label: 'Ingredients',
      ids: ingredientResolution.value.missing,
    },
  ].filter((group) => group.ids.length)
)
const dishIntegrityNote = computed(() =>
  normalizeString((dish.value as Record<string, unknown> | null)?.integrity_note)
)
const legacyRecipeIds = computed(() =>
  normalizeDishStringArray((dish.value as Record<string, unknown> | null)?.recipe_ids)
)
const menuPlacements = computed(() =>
  Array.isArray(dish.value?.menu_placements) ? dish.value.menu_placements : []
)
const resolvedComponentsDebug = computed(() => ({
  dish_id: dishId.value,
  language: displayLanguage.value,
  legacy_recipe_ids: legacyRecipeIds.value,
  mise: miseResolution.value,
  ingredients: ingredientResolution.value,
}))
const fireuxDebugData = computed(() => ({
  ...debug.value,
  dish: dish.value,
  resolved_components: resolvedComponentsDebug.value,
  menu_usage: menuUsage.value,
}))
</script>
