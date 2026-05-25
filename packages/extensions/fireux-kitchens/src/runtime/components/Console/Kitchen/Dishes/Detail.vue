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

    <div
      v-if="dish"
      class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div class="space-y-6">
        <DishCardsProfile :dish="dish" />

        <UCard>
          <template #header>
            <div class="collection-manager__header">
              <div class="collection-manager__title">
                <h2>Menu placements</h2>
                <p>Where this dish appears in current menus.</p>
              </div>

              <div class="collection-manager__controls">
                <UBadge variant="soft">
                  {{ placementRows.length }}
                </UBadge>
              </div>
            </div>
          </template>

          <div
            v-if="placementRows.length"
            class="collection-stack"
          >
            <article
              v-for="placement in placementRows"
              :key="placement.id"
              class="flex items-center gap-3 rounded-lg border border-default bg-default p-3"
            >
              <UChip
                :color="placement.active ? 'success' : 'error'"
                position="top-left"
                inset
              >
                <UAvatar
                  icon="i-lucide-list-tree"
                  size="md"
                />
              </UChip>

              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-semibold text-highlighted">
                  {{ placement.menuName }}
                </div>
                <p class="truncate text-xs text-dimmed">
                  {{ placement.sectionLabel }}
                </p>
              </div>

              <UButton
                :to="placement.to"
                color="neutral"
                variant="ghost"
                icon="i-lucide-arrow-right"
                size="xs"
                aria-label="Open menu section"
              />
            </article>
          </div>

          <p
            v-else
            class="text-sm text-muted"
          >
            Not placed in a menu section.
          </p>
        </UCard>
      </div>

      <form
        class="space-y-6"
        @submit.prevent="saveDish"
      >
        <UCard>
          <template #header>
            <div class="console-card-header">
              <div>
                <div class="console-card-header__title">Edit copy</div>
                <p class="text-sm text-dimmed">
                  Update the default dish text.
                </p>
              </div>
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
                :rows="5"
              />
            </UFormField>
          </div>

          <template #footer>
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

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="Read only"
              description="You can inspect this dish, but editing is disabled for the selected kitchen."
            />
          </template>
        </UCard>
      </form>
    </div>

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
      title="Kitchen dish detail"
      scope="console"
      :data="fireuxDebugData"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, reactive, ref, watch } from 'vue'
import { useKitchenConsoleDish } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleDish'
import { useDishDelete } from '../../../../../composables/fireux/firestore/dish/mutations/useDishDelete'
import { useDishUpdate } from '../../../../../composables/fireux/firestore/dish/mutations/useDishUpdate'
import {
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
})

const normalizeString = (value: unknown) => String(value ?? '').trim()
const certifiedLanguageMap = (value: unknown) => {
  const source = normalizeDishTranslatedText(value)

  return Object.fromEntries(
    ['de', 'en']
      .map((language) => [language, normalizeString(source[language])])
      .filter(([, text]) => text)
  )
}

const buildSignature = () =>
  JSON.stringify({
    name: normalizeString(form.name),
    description: normalizeString(form.description),
  })

const isDirty = computed(() => buildSignature() !== originalSignature.value)

const placementRows = computed(() =>
  menuUsage.value.map((placement) => ({
    id: `${placement.menuId}:${placement.sectionId}:${placement.itemId}`,
    menuName: placement.menuName,
    sectionLabel: placement.sectionLabel,
    active: placement.active,
    to: `/console/kitchen/menus/${encodeURIComponent(
      placement.menuId
    )}/${encodeURIComponent(placement.sectionId)}`,
  }))
)

const fireuxDebugData = computed(() => ({
  ...debug.value,
  dish: dish.value,
  menu_usage: menuUsage.value,
}))

const resetForm = (source: Dish | null) => {
  saveMessage.value = ''

  form.name = normalizeString(source?.name)
  form.description = normalizeString(source?.description)
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
    const description = normalizeString(form.description)
    const names = certifiedLanguageMap(dish.value.names)
    const descriptions = certifiedLanguageMap(dish.value.descriptions)
    names.de = name
    names.en = name

    if (description) {
      descriptions.de = description
    } else {
      delete descriptions.de
    }

    await updateDish(
      dishId.value,
      {
        name,
        description,
        names,
        descriptions,
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
    ? `\n\n${usageCount} menu item${
        usageCount === 1 ? '' : 's'
      } reference this dish. This delete will not cascade.`
    : ''
  const ok = window.confirm(
    `Delete dish "${title}"?\n\nThis will only delete the dish document.${usageNote}`
  )
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
