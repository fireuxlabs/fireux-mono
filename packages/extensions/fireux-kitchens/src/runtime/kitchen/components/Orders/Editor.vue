<template>
  <section class="workspace-surface">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p v-if="order" class="text-sm text-muted">
        {{ dirty ? 'Unsaved changes' : revision ? 'Saved order' : 'New order' }}
        · not submitted
      </p>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="!initialOrder"
          label="New order"
          color="neutral"
          variant="soft"
          :disabled="!canInitiate || saving || dirty || hasLineInput || quantityEditing"
          @click="resetDraft"
        />
        <UButton
          v-if="dirty || hasLineInput || quantityEditing"
          label="Discard changes"
          color="neutral"
          variant="ghost"
          :disabled="saving"
          @click="discardChanges"
        />
        <UButton
          v-if="order"
          label="Save order"
          icon="i-lucide-save"
          :loading="saving"
          :disabled="
            !canSave ||
            hasLineInput ||
            quantityEditing ||
            (revision > 0 && !dirty)
          "
          @click="saveDraft"
        />
      </div>
    </div>
    <p v-if="!order && canInitiate" class="text-sm text-muted">Start a new order as {{ staffName }}.</p>
    <p v-if="canSave && !canInitiate" class="text-sm text-muted">Your staff profile must have a name before starting an order.</p>
    <p v-if="!canSave" class="text-sm text-muted">
      Sign in and select an available Kitchen to save orders.
    </p>
    <p v-if="hasLineInput" class="text-sm text-muted">
      Add or clear the current line before saving or opening another order.
    </p>
    <UAlert
      v-if="saveError"
      color="error"
      title="Order could not be saved"
      :description="saveError"
    >
      <template #actions><MoleculesCopyError :message="saveError" /></template>
    </UAlert>
    <fieldset
      v-if="order"
      :disabled="saving"
      class="grid min-w-0 items-start gap-4 md:grid-cols-2"
    >
      <UCard>
        <template #header
          ><h2 class="text-lg font-semibold">Add line</h2></template
        >
        <form @submit.prevent="submitLine">
          <fieldset :disabled="quantityEditing" class="grid gap-4">
            <UFormField label="Item name" required>
              <UInput
                v-model="itemName"
                placeholder="What is being ordered?"
                :maxlength="300"
                required
                class="w-full"
              />
            </UFormField>
            <UFormField label="Quantity" required>
              <!-- @vue-generic {string | number, {}} -->
              <UInput
                v-model="quantity"
                type="number"
                step="any"
                required
                class="w-full"
              />
            </UFormField>
            <UFormField label="Unit" required>
              <USelect v-model="unitCode" :items="units" class="w-full" />
            </UFormField>
            <UAlert
              v-if="lineError"
              color="error"
              title="Line could not be added"
              :description="lineError"
            />
            <UButton
              v-if="hasLineInput"
              label="Clear fields"
              color="neutral"
              variant="ghost"
              @click="clearLineInput"
            />
            <UButton
              type="submit"
              label="Add line"
              icon="i-lucide-plus"
              class="justify-center"
            />
          </fieldset>
        </form>
      </UCard>
      <div class="space-y-3">
        <UAlert
          v-if="editError"
          color="error"
          title="Order could not be changed"
          :description="editError"
        />
        <KitchenOrdersTicket
          :order="order"
          @update-quantity="updateQuantity"
          @remove-line="removeLine"
          @editing-change="quantityEditing = $event"
        />
      </div>
    </fieldset>
    <UAlert
      v-if="!channel"
      title="POS orders are not enabled for this App"
      color="neutral"
    />

  </section>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  createOrderDraft,
  addOrderLine,
  updateOrderLineQuantity,
  removeOrderLine,
  readOrder,
} from '../../utils/ordering'
import { useRuntimeConfig } from '#imports'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
import { useKitchenOrderDraftSave } from '../../composables/useKitchenOrderDraftSave'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUserRead } from 'fireux-core/runtime/user/composables/useUserRead'
import type { Order, SavedOrderDraft } from '../../models/order.model'
const props = defineProps<{initialOrder?: SavedOrderDraft}>()
const workspace = useKitchenWorkspace()
const active = computed(() => workspace.outcome.value === 'ready')
const {
  save,
  pending: saving,
  error: saveError,
  canSave,
  scopeVersion,
} = useKitchenOrderDraftSave(workspace.id, active)
const configuration = useRuntimeConfig().public.ordering
const channel = configuration?.channels?.includes('pos') ? 'pos' : undefined
const { currentUser } = useAuth()
const staff = useUserRead(computed(() => currentUser.value?.uid || ''))
const staffName = computed(() => staff.user.value?.display_name?.trim() || '')
const canInitiate = computed(() => Boolean(channel && canSave.value && !currentUser.value?.isAnonymous && staff.outcome.value === 'ready' && staffName.value))
const order = ref<Order | null>(null)
const itemName = ref('')
const quantity = ref<string | number>(1)
const unitCode = ref('C62')
const lineError = ref('')
const editError = ref('')
const quantityEditing = ref(false)
const lastSaved = ref<SavedOrderDraft | null>(null)
const baseline = ref(JSON.stringify(order.value))
const revision = computed(() => lastSaved.value?.revision || 0)
const dirty = computed(() => JSON.stringify(order.value) !== baseline.value)
const hasLineInput = computed(
  () => Boolean(itemName.value.trim()) || Number(quantity.value) !== 1
)
const units = [
  { label: 'Each', value: 'C62' },
  { label: 'Kilograms', value: 'KGM' },
  { label: 'Litres', value: 'LTR' },
  { label: 'Hours', value: 'HUR' },
]
function submitLine() {
  if (!order.value || saving.value || quantityEditing.value) return
  lineError.value = ''
  try {
    order.value = addOrderLine(order.value, {
      id: crypto.randomUUID(),
      item: { name: itemName.value },
      quantity: Number(quantity.value),
      unit_code: unitCode.value,
    })
    itemName.value = ''
    quantity.value = 1
  } catch (error) {
    lineError.value =
      error instanceof Error ? error.message : 'Line could not be added.'
  }
}
function updateQuantity(lineId: string, quantity: number) {
  if (!order.value || saving.value) return
  editError.value = ''
  try {
    order.value = updateOrderLineQuantity(order.value, lineId, quantity)
  } catch (error) {
    editError.value =
      error instanceof Error ? error.message : 'Quantity could not be changed.'
  }
}
function removeLine(lineId: string) {
  if (!order.value || saving.value) return
  editError.value = ''
  try {
    order.value = removeOrderLine(order.value, lineId)
  } catch (error) {
    editError.value =
      error instanceof Error ? error.message : 'Line could not be removed.'
  }
}
function clearLineInput() {
  itemName.value = ''
  quantity.value = 1
  lineError.value = ''
}
function resetDraft() {
  if (!canInitiate.value || saving.value || dirty.value || hasLineInput.value || quantityEditing.value) return
  const draft = createOrderDraft({ id: crypto.randomUUID(), number: '' }, 'pos', configuration)
  draft.placed_by = { kind: 'person', id: currentUser.value!.uid, name: staffName.value }
  order.value = draft
  quantityEditing.value = false
  lastSaved.value = null
  baseline.value = JSON.stringify(order.value)
  clearLineInput()
  unitCode.value = 'C62'
  editError.value = ''
}
function openDraft(draft: SavedOrderDraft) {
  if (
    saving.value ||
    dirty.value ||
    hasLineInput.value ||
    quantityEditing.value
  )
    return
  order.value = readOrder(draft.order)
  lastSaved.value = { order: readOrder(draft.order), revision: draft.revision }
  baseline.value = JSON.stringify(order.value)
  clearLineInput()
  editError.value = ''
}
function discardChanges() {
  if (saving.value) return
  if (lastSaved.value) order.value = readOrder(lastSaved.value.order)
  else {
    order.value = null
    baseline.value = JSON.stringify(null)
    clearLineInput()
    quantityEditing.value = false
    resetDraft()
  }
  baseline.value = JSON.stringify(order.value)
  clearLineInput()
  editError.value = ''
}
async function saveDraft() {
  if (!order.value || hasLineInput.value || quantityEditing.value) return
  const originId = order.value.id
  const result = await save(order.value, revision.value)
  if (!result || order.value?.id !== originId) return
  order.value = result.order
  lastSaved.value = {
    order: readOrder(result.order),
    revision: result.revision,
  }
  baseline.value = JSON.stringify(order.value)
}
watch(scopeVersion, () => {
  order.value = null
  lastSaved.value = null
  baseline.value = JSON.stringify(null)
  quantityEditing.value = false
  clearLineInput()
  editError.value = ''
  if (props.initialOrder && canSave.value) openDraft(props.initialOrder)
}, { flush: 'sync' })
watch(() => props.initialOrder, value => { if (value) openDraft(value) }, {immediate:true})
</script>
