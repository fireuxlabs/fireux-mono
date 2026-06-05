<template>
  <UCard v-if="menu">
    <template #header>
      <div>
        <h2 class="text-base font-semibold text-highlighted">Menu details</h2>
        <p class="text-sm text-dimmed">Edit the original menu name and optional description.</p>
      </div>
    </template>

    <div class="grid gap-4 md:grid-cols-2">
      <MoleculesFormsFirestoreSimpleField
        label="Name"
        :firebase-value="menuName"
        placeholder="Comida Casera"
        :maxlength="120"
        :disabled="!canWrite"
        disabled-message="This menu is read-only."
        :validation-function="validateMenuName"
        :update-function="handleName"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Original description"
        type="textarea"
        :rows="3"
        :firebase-value="menuDescription"
        placeholder="Optional"
        :maxlength="500"
        :disabled="!canWrite"
        disabled-message="This menu is read-only."
        :update-function="handleDescription"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenu'
import { useKitchenMenuSproochliSync } from '../../../../composables/fireux/console/kitchen/operations/useKitchenMenuSproochliSync'
import type { MenuUpdateInput } from '../../../../models/menu.model'

const {
  menu,
  menuId,
  kitchenId,
  canWrite,
  updateMenu,
} = useKitchenConsoleMenu()
const {
  markMenuNeedsTranslationRefresh,
  syncMenuField,
} = useKitchenMenuSproochliSync()
const toast = useToastify()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const menuName = computed(() => normalizeString(menu.value?.name))
const menuDescription = computed(() => normalizeString(menu.value?.description))
const isPublished = computed(() => menu.value?.status === 'published')

const validateMenuName = (value: string) => {
  const next = normalizeString(value)
  return {
    isValid: Boolean(next),
    message: next ? '' : 'Menu name is required.',
  }
}

async function updateDetailsField(
  field: 'name' | 'description',
  patch: MenuUpdateInput,
  sourceText: string,
  successTitle: string,
  failTitle: string
) {
  if (!canWrite.value) throw new Error('This menu is read-only.')
  if (!kitchenId.value || !menuId.value) throw new Error('No menu selected.')
  const shouldRefreshTranslations = isPublished.value
  try {
    await updateMenu(kitchenId.value, menuId.value, patch)
    if (shouldRefreshTranslations) {
      await refreshPublishedField(field, sourceText)
    }
    toast.add({ title: successTitle, color: 'success', icon: 'i-lucide-check' })
    return 'success'
  } catch (error) {
    toast.add({
      title: failTitle,
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  }
}

function showTranslationFailures(
  failures: Array<{ language?: string; message?: string }> = []
) {
  if (!failures.length) return

  toast.add({
    title: 'Some translations need attention',
    description: failures
      .map((failure) => failure.language || failure.message)
      .filter(Boolean)
      .join(', '),
    color: 'warning',
    icon: 'i-lucide-languages',
  })
}

async function refreshPublishedField(field: 'name' | 'description', sourceText: string) {
  try {
    const result = await syncMenuField({
      menu: menu.value,
      field,
      sourceText,
    })
    showTranslationFailures(result.failures)
    if (result.failures?.length) {
      await markMenuNeedsTranslationRefresh(menu.value)
    }
  } catch (error) {
    await markMenuNeedsTranslationRefresh(menu.value)
    toast.add({
      title: 'Translations were not refreshed',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'warning',
      icon: 'i-lucide-languages',
    })
  }
}

const handleName = async (value: string) =>
  updateDetailsField(
    'name',
    { name: normalizeString(value) },
    normalizeString(value),
    'Menu name updated',
    'Could not update menu name'
  )

const handleDescription = async (value: string) =>
  updateDetailsField(
    'description',
    { description: normalizeString(value) },
    normalizeString(value),
    'Menu description updated',
    'Could not update menu description'
  )
</script>
