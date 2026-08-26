<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Menu details</h2>
          <p class="text-sm text-dimmed">
            Edit the menu name and guest-facing description.
          </p>
        </div>

        <UBadge :color="statusColor" variant="soft">
          {{ menu.status }}
        </UBadge>
      </div>
    </template>

    <div class="grid gap-4 md:grid-cols-2">
      <MoleculesFormsEditableSimpleField
        label="Name"
        :value="menuName"
        placeholder="Comida Casera"
        :maxlength="120"
        :disabled="!canWrite"
        disabled-message="This menu is read-only."
        :validation-function="validateMenuName"
        :update="handleName"
      />

      <MoleculesFormsEditableSimpleField
        label="Identifier"
        :value="menuId"
        placeholder="pizza-snacks-and-drinks"
        :maxlength="80"
        :disabled="!canWrite"
        disabled-message="This menu is read-only."
        :validation-function="validateMenuId"
        :formatting-function="formatMenuId"
        :update="handleMenuId"
      />

      <MoleculesFormsEditableSimpleField
        class="md:col-span-2"
        label="Menu description"
        type="textarea"
        :rows="3"
        :value="menuDescription"
        placeholder="Short guest-facing description"
        :maxlength="500"
        :disabled="!canWrite"
        disabled-message="This menu is read-only."
        :update="handleDescription"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { computed } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceMenu } from '../../../../composables/workspace/Menus/useKitchenWorkspaceMenu'
import type { KitchenMenuUpdateInput as MenuUpdateInput } from '../../../../../menu/utils/kitchen-menu.ts'

const { menu, kitchenId, menuId, canWrite, updateMenu, renameMenu } =
  useKitchenWorkspaceMenu()
const toast = useToastify()
const router = useRouter()

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
const formatMenuId = (value: string) => normalizeSlug(value)
const validateMenuId = (value: string) => {
  const next = formatMenuId(value)
  return {
    isValid: Boolean(next),
    message: next ? '' : 'Menu identifier is required.',
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
  if (!nextMenuId) throw new Error('Menu identifier is required.')
  if (nextMenuId === currentMenuId) return 'unchanged'

  try {
    const result = await renameMenu(kitchenId.value, currentMenuId, nextMenuId)
    if (result.changed) {
      await router.replace(
        `/workspace/kitchen/menus/${encodeURIComponent(result.id)}`
      )
    }
    toast.add({
      title: 'Menu identifier updated',
      color: 'success',
      icon: 'i-lucide-check',
    })
    return 'success'
  } catch (error) {
    toast.add({
      title: 'Could not update menu identifier',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  }
}
</script>
