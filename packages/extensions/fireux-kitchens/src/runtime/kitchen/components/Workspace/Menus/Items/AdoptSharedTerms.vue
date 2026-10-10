<template>
  <UModal v-model:open="open" title="Use shared prices" :dismissible="!busy">
    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      :disabled="!writable"
      @click="open = true"
      >Use shared prices</UButton
    >
    <template #body>
      <div class="space-y-4">
        <p class="text-sm">
          Keep the current prices and extras for {{ row.label }}. Future price
          edits will apply to every menu using this shared item.
        </p>
        <div v-if="row.priceOptions.length" class="space-y-3">
          <p class="text-sm text-muted">
            Optional details distinguish choices with the same size.
          </p>
          <div
            v-for="(form, index) in forms"
            :key="index"
            class="space-y-2 rounded-lg border border-default p-3"
          >
            <p class="font-medium">
              {{
                row.priceOptions[index]?.label ||
                `${row.priceOptions[index]?.quantity} ${row.priceOptions[index]?.unit}`
              }}
            </p>
            <div class="grid grid-cols-2 gap-2">
              <UFormField label="Volume (ml)"
                ><UInput
                  v-model="form.volume"
                  type="number"
                  min="1"
                  :disabled="busy"
                  class="w-full"
              /></UFormField>
              <UFormField label="Container"
                ><UInput
                  v-model="form.container"
                  placeholder="Glass, bottle, can"
                  :disabled="busy"
                  class="w-full"
              /></UFormField>
              <UFormField label="Source" class="col-span-2"
                ><UInput
                  v-model="form.source"
                  placeholder="Fountain"
                  :disabled="busy"
                  class="w-full"
              /></UFormField>
            </div>
          </div>
        </div>
        <MoleculesCopyError v-if="error" :message="error" />
      </div>
    </template>
    <template #footer>
      <UButton :loading="busy" :disabled="!writable || busy" @click="adopt"
        >Use shared prices</UButton
      >
      <UButton
        color="neutral"
        variant="ghost"
        :disabled="busy"
        @click="open = false"
        >Cancel</UButton
      >
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref } from 'vue'
import { useRoute } from '#imports'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useKitchenAccess } from '../../../../composables/useKitchenAccess'
import { useKitchenWorkspaceSelection } from '../../../../composables/workspace/useKitchenWorkspaceSelection'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { MenuSectionItemRow } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
const props = defineProps<{
  row: MenuSectionItemRow
  kitchenId: string
  menuId: string
  sectionId: string
  canWrite: boolean
}>()
const emit = defineEmits<{ adopted: [id: string] }>()
const { currentUser } = useAuth()
const { appUser, appPending, appError, appOutcome } = useUserSession()
const access = useKitchenAccess()
const { selectedId } = useKitchenWorkspaceSelection()
const writable = computed(
  () =>
    props.canWrite &&
    Boolean(
      currentUser.value && !currentUser.value.isAnonymous && appUser.value
    ) &&
    !appPending.value &&
    !appError.value &&
    appOutcome.value === 'ready' &&
    access.outcome.value === 'ready' &&
    access.ids.value.includes(props.kitchenId) &&
    selectedId.value === props.kitchenId
)
const open = ref(false),
  busy = ref(false),
  error = ref('')
const forms = ref<
  Array<{ volume: string | number; container: string; source: string }>
>([])
let operation = 0
const route = useRoute()
const ownerSources = [
  open,
  () => route.fullPath,
  () => props.kitchenId,
  () => props.menuId,
  () => props.sectionId,
  () => props.row.id,
  () => props.canWrite,
  () => JSON.stringify(props.row.priceOptions),
  () => JSON.stringify(props.row.addOns),
  appPending,
  appError,
  appOutcome,
  () => JSON.stringify(access.ids.value),
  access.outcome,
  selectedId,
]
useMenuEditorScope(ownerSources, () => {
  operation++
  busy.value = false
  error.value = ''
  forms.value = props.row.priceOptions.map(() => ({
    volume: '',
    container: '',
    source: '',
  }))
})
const captureScope = useMenuEditorScope(
  [...ownerSources, () => JSON.stringify(forms.value)],
  () => {
    operation++
    busy.value = false
    error.value = ''
  }
)
onScopeDispose(() => {
  operation++
  busy.value = false
  error.value = ''
})
async function adopt() {
  if (!open.value || busy.value || !writable.value || !currentUser.value) return
  const isCurrent = captureScope(),
    user = currentUser.value
  const body: Record<string, unknown> = {
    kitchenId: props.kitchenId,
    menuId: props.menuId,
    sectionId: props.sectionId,
    itemId: props.row.id,
  }
  error.value = ''
  const variantForms = forms.value.map((form) => ({
    ...(String(form.volume).trim()
      ? { volume: { value: Number(form.volume), unit: 'ml' } }
      : {}),
    ...(form.container.trim() ? { container: form.container.trim() } : {}),
    ...(form.source.trim() ? { source: form.source.trim() } : {}),
  }))
  if (
    variantForms.some(
      (form) =>
        form.volume &&
        (!Number.isFinite(form.volume.value) || form.volume.value <= 0)
    )
  ) {
    error.value = 'Enter a volume greater than zero.'
    return
  }
  if (variantForms.some((form) => Object.keys(form).length)) {
    body.variantForms = variantForms
    body.expectedPriceOptions = JSON.parse(
      JSON.stringify(props.row.priceOptions)
    )
  }
  const request = ++operation
  busy.value = true
  try {
    const token = await user.getIdToken()
    if (!isCurrent() || currentUser.value?.uid !== user.uid || !writable.value)
      return
    const result = await $fetch<{ sellableId: string }>(
      '/api/workspace/kitchen/sellables/bind',
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body,
      }
    )
    if (
      typeof result?.sellableId !== 'string' ||
      result.sellableId !== result.sellableId.trim() ||
      !isFirestoreDocumentId(result.sellableId)
    )
      throw new Error(
        'Shared prices response did not contain a valid Sellable identity.'
      )
    if (isCurrent()) {
      emit('adopted', result.sellableId)
      open.value = false
    }
  } catch {
    if (isCurrent())
      error.value =
        'Could not confirm shared prices. Try again to check or finish this action.'
  } finally {
    if (request === operation) busy.value = false
  }
}
</script>
