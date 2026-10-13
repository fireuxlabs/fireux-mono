<template>
  <section class="workspace-surface">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p v-if="order" class="text-sm text-muted">
        {{ dirty ? 'Unsaved changes' : revision ? 'Saved draft' : 'New draft' }}
        · not submitted
      </p>
      <div v-if="order" class="flex flex-wrap gap-2">
        <UButton
          label="New draft"
          color="neutral"
          variant="soft"
          :disabled="saving || dirty || hasLineInput || quantityEditing"
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
          label="Save draft"
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
    <p v-if="!canSave" class="text-sm text-muted">
      Sign in and select an available Kitchen to save drafts.
    </p>
    <p v-if="hasLineInput" class="text-sm text-muted">
      Add or clear the current line before saving or opening another draft.
    </p>
    <UAlert
      v-if="saveError"
      color="error"
      title="Draft could not be saved"
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
        <OrderTicket
          :order="order"
          @update-quantity="updateQuantity"
          @remove-line="removeLine"
          @editing-change="quantityEditing = $event"
        />
      </div>
    </fieldset>
    <UAlert
      v-else
      title="POS drafts are not enabled for this App"
      color="neutral"
    />
    <UCard>
      <template #header
        ><h2 class="text-lg font-semibold">Saved drafts</h2></template
      >
      <p v-if="draftOutcome === 'pending'" role="status">
        Loading saved drafts…
      </p>
      <UAlert
        v-else-if="draftOutcome === 'error'"
        color="error"
        title="Saved drafts could not be loaded"
      >
        <template #actions
          ><MoleculesCopyError
            :message="
              String(draftReadError || 'Saved drafts could not be loaded.')
            "
        /></template>
      </UAlert>
      <template
        v-else-if="draftOutcome === 'ready' || draftOutcome === 'empty'"
      >
        <ul v-if="drafts.length" class="space-y-2">
          <li
            v-for="draft in drafts"
            :key="draft.order.id"
            class="flex flex-wrap items-center justify-between gap-3"
          >
            <span
              >{{ draft.order.number }} ·
              {{ draft.order.lines[0]?.item.name || 'No items yet' }} ·
              {{ draft.order.lines.length }} lines</span
            >
            <UButton
              label="Open"
              color="neutral"
              variant="soft"
              :disabled="saving || dirty || hasLineInput || quantityEditing"
              @click="openDraft(draft)"
            />
          </li>
        </ul>
        <p v-else class="text-muted">No saved drafts yet</p>
        <UButton
          v-if="hasMore"
          label="Load more drafts"
          color="neutral"
          variant="ghost"
          @click="loadMore"
        />
      </template>
      <p v-else class="text-muted">
        Select an available Kitchen to reopen drafts.
      </p>
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import OrderTicket from '../../Orders/Ticket.vue'
import {
  createOrderDraft,
  addOrderLine,
  updateOrderLineQuantity,
  removeOrderLine,
  readOrder,
} from '../../../utils/ordering'
import { useRuntimeConfig } from '#imports'
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useKitchenOrderDraftCollection } from '../../../composables/useKitchenOrderDraftCollection'
import { useKitchenOrderDraftSave } from '../../../composables/useKitchenOrderDraftSave'
import type { SavedOrderDraft } from '../../../models/order.model'
const workspace = useKitchenWorkspace()
const active = computed(() => workspace.outcome.value === 'ready')
const {
  save,
  pending: saving,
  error: saveError,
  canSave,
  scopeVersion,
} = useKitchenOrderDraftSave(workspace.id, active)
const {
  drafts,
  outcome: draftOutcome,
  error: draftReadError,
  hasMore,
  loadMore,
} = useKitchenOrderDraftCollection(
  computed(() => (active.value ? workspace.id.value : ''))
)
const configuration = useRuntimeConfig().public.ordering
const channel = configuration?.channels?.includes('pos') ? 'pos' : undefined
const order = ref(
  channel
    ? createOrderDraft(
        { id: crypto.randomUUID(), number: 'Draft' },
        channel,
        configuration
      )
    : null
)
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
  order.value = channel
    ? createOrderDraft(
        { id: crypto.randomUUID(), number: 'Draft' },
        channel,
        configuration
      )
    : null
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
  else resetDraft()
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
watch(scopeVersion, resetDraft, { flush: 'sync' })
</script>
