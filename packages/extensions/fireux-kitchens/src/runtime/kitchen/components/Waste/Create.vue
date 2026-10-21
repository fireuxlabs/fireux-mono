<template>
  <form class="space-y-4" @submit.prevent="submit">
    <UFormField label="Wasted item" required>
      <UInput v-model="itemName" placeholder="Loaf of bread" class="w-full" />
    </UFormField>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Quantity" required>
        <UInput
          v-model.number="quantity"
          type="number"
          min="0.01"
          step="any"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Unit" required>
        <UInput v-model="unit" placeholder="kg, each, tray" class="w-full" />
      </UFormField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Reason" required>
        <USelect
          v-model="reason"
          :items="[...KITCHEN_WASTE_REASON_OPTIONS]"
          value-key="value"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Source" required>
        <USelect
          v-model="source"
          :items="[...KITCHEN_WASTE_SOURCE_OPTIONS]"
          value-key="value"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField label="Notes">
      <UTextarea v-model="notes" :rows="3" class="w-full" />
    </UFormField>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Waste was not recorded"
      :description="error"
    />

    <div class="flex justify-end gap-2">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
      />
      <UButton
        label="Record Waste"
        icon="i-lucide-trash-2"
        type="submit"
        :loading="saving"
        :disabled="!canSubmit"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import { computed, ref, watch, onScopeDispose } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  KITCHEN_WASTE_REASON_OPTIONS,
  KITCHEN_WASTE_SOURCE_OPTIONS,
  type KitchenWasteReason,
  type KitchenWasteSource,
} from '../../utils/waste-event'
import { useKitchenWaste } from '../../composables/workspace/waste/useKitchenWaste'

const emit = defineEmits<{
  cancel: []
  created: [result: { id: string; itemName: string }]
}>()
const { kitchenId, canWrite, recordWaste } = useKitchenWaste()
const itemName = ref('')
const quantity = ref<number | null>(null)
const unit = ref('')
const reason = ref<KitchenWasteReason>('spoilage')
const source = ref<KitchenWasteSource>('prep')
const notes = ref('')
const saving = ref(false)
const error = ref('')
const canSubmit = computed(
  () =>
    canWrite.value &&
    Boolean(itemName.value.trim() && unit.value.trim()) &&
    Number(quantity.value) > 0 &&
    !saving.value
)

const { currentUser } = useAuth()
const config = useFireUXConfig()
const { appUser } = useUserSession()
let epoch = 0
watch([kitchenId, () => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value)], () => {
  epoch += 1; saving.value = false; error.value = ''
  itemName.value = ''; quantity.value = null; unit.value = ''; notes.value = ''
  reason.value = 'spoilage'; source.value = 'prep'
}, { flush: 'sync' })
onScopeDispose(() => { epoch += 1 })
async function submit() {
  const expected = epoch
  const requestedItemName = itemName.value.trim()
  if (!canSubmit.value) return
  saving.value = true
  error.value = ''
  try {
    const id = await recordWaste({
      item_name: itemName.value,
      quantity: Number(quantity.value),
      unit: unit.value,
      reason: reason.value,
      source: source.value,
      notes: notes.value,
    })
    if (epoch !== expected) return
    emit('created', { id, itemName: requestedItemName })
  } catch (cause) {
    if (epoch !== expected) return
    error.value =
      cause instanceof Error ? cause.message : 'Waste could not be recorded.'
  } finally {
    if (epoch === expected) saving.value = false
  }
}
</script>
