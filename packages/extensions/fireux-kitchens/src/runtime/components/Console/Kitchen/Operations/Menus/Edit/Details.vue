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
        label="URL id"
        :firebase-value="menuId"
        placeholder="pizza-snacks-and-drinks"
        :maxlength="80"
        :disabled="!canWrite"
        disabled-message="This menu is read-only."
        :validation-function="validateMenuId"
        :formatting-function="formatMenuId"
        :update-function="handleMenuId"
      />

      <MoleculesFormsFirestoreSimpleField
        class="md:col-span-2"
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

      <div class="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-highlighted">
          Service hours
        </h3>

        <UButton
          size="sm"
          color="neutral"
          variant="soft"
          :disabled="!canWrite || !kitchenOperationHours.windows.length"
          @click="handleCopyServiceHours"
        >
          Copy kitchen operation hours
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { computed } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'
import type {
  MenuOrderingConfig,
  MenuUpdateInput,
} from '../../../../../../models/kitchen/menu/menu.model'
import { readKitchenOperationHours } from '../../../../../../utils/kitchen-spine'

const {
  menu,
  selectedKitchen,
  kitchenId,
  menuId,
  canWrite,
  updateMenu,
  renameMenu,
} = useKitchenConsoleMenu()
const toast = useToastify()
const router = useRouter()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const menuName = computed(() => normalizeString(menu.value?.name))
const menuDescription = computed(() => normalizeString(menu.value?.description))
const kitchenOperationHours = computed(() =>
  readKitchenOperationHours(selectedKitchen.value as Record<string, unknown> | null)
)
const ordering = computed<MenuOrderingConfig>(() => ({
  enabled: menu.value?.ordering?.enabled === true,
  order_types: Array.isArray(menu.value?.ordering?.order_types)
    ? menu.value.ordering.order_types
    : [],
  ...(menu.value?.ordering?.service_hours
    ? { service_hours: menu.value.ordering.service_hours }
    : {}),
}))
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
const formatMenuId = (value: string) => normalizeSlug(value)
const validateMenuId = (value: string) => {
  const next = formatMenuId(value)
  return {
    isValid: Boolean(next),
    message: next ? '' : 'URL id is required.',
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

async function handleMenuId(value: string) {
  if (!canWrite.value) throw new Error('This menu is read-only.')
  const currentMenuId = normalizeString(menuId.value)
  const nextMenuId = formatMenuId(value)
  if (!kitchenId.value || !currentMenuId) throw new Error('No menu selected.')
  if (!nextMenuId) throw new Error('URL id is required.')
  if (nextMenuId === currentMenuId) return 'unchanged'

  try {
    const result = await renameMenu(kitchenId.value, currentMenuId, nextMenuId)
    if (result.changed) {
      await router.replace(`/console/kitchen/menus/${encodeURIComponent(result.id)}`)
    }
    toast.add({
      title: 'Menu URL id updated',
      color: 'success',
      icon: 'i-lucide-check',
    })
    return 'success'
  } catch (error) {
    toast.add({
      title: 'Could not update menu URL id',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  }
}

async function handleCopyServiceHours() {
  const operationHours = kitchenOperationHours.value
  if (!operationHours.windows.length) {
    toast.add({
      title: 'No kitchen operation hours to copy',
      description: 'Set kitchen operation hours first, then copy them to this menu.',
      color: 'warning',
      icon: 'i-lucide-clock-alert',
    })
    return
  }

  await updateDetailsField(
    {
      ordering: {
        ...ordering.value,
        service_hours: {
          inherit_kitchen_operation_hours: true,
          operation_hours: operationHours,
        },
      },
    },
    'Service hours updated',
    'Could not update service hours'
  )
}
</script>
