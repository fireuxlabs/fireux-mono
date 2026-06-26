<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Menu details</h2>
          <p class="text-sm text-dimmed">Edit the menu name and guest-facing description.</p>
        </div>

        <UBadge :color="statusColor" variant="soft">
          {{ menu.status }}
        </UBadge>
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
        label="Menu description"
        type="textarea"
        :rows="3"
        :firebase-value="menuDescription"
        placeholder="Short guest-facing description"
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
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'
import type { MenuUpdateInput } from '../../../../../models/menu/menu.model'

const {
  menu,
  kitchenId,
  canWrite,
  updateMenu,
} = useKitchenConsoleMenu()
const toast = useToastify()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const menuName = computed(() => normalizeString(menu.value?.name))
const menuDescription = computed(() => normalizeString(menu.value?.description))
const statusColor = computed(() =>
  menu.value?.status === 'published'
    ? 'success'
    : menu.value?.status === 'archived'
      ? 'neutral'
      : 'warning'
)

const validateMenuName = (value: string) => {
  const next = normalizeString(value)
  return {
    isValid: Boolean(next),
    message: next ? '' : 'Menu name is required.',
  }
}

async function updateDetailsField(
  patch: MenuUpdateInput,
  successTitle: string,
  failTitle: string
) {
  if (!canWrite.value) throw new Error('This menu is read-only.')
  const currentMenuId = normalizeString(menu.value?.id)
  if (!kitchenId.value || !currentMenuId) throw new Error('No menu selected.')
  try {
    await updateMenu(kitchenId.value, currentMenuId, patch)
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

const handleName = async (value: string) =>
  updateDetailsField(
    { name: normalizeString(value) },
    'Menu name updated',
    'Could not update menu name'
  )

const handleDescription = async (value: string) =>
  updateDetailsField(
    { description: normalizeString(value) },
    'Menu description updated',
    'Could not update menu description'
  )
</script>
