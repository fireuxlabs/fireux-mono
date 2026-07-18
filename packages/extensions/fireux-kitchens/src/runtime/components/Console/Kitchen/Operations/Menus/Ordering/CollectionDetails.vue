<template>
  <UCard>
    <template #header>
      <div>
        <h3 class="text-sm font-semibold text-highlighted">Collection details</h3>
        <p class="text-sm text-dimmed">
          Tell customers where to collect and which contact details the Kitchen needs.
        </p>
      </div>
    </template>

    <div class="grid gap-5">
      <MoleculesFormsFirestoreSimpleField
        label="Collection point"
        type="textarea"
        :rows="2"
        :maxlength="240"
        :firebase-value="handoffInstructions"
        placeholder="Collect from the restaurant counter beside reception."
        :disabled="disabled"
        disabled-message="This menu is read-only."
        :update-function="updateHandoffInstructions"
      />

      <MoleculesFormsFirestoreChoiceGroup
        label="Required customer details"
        empty-label="All contact details are optional"
        :firebase-value="requiredFields"
        :options="contactOptions"
        :disabled="disabled"
        disabled-message="This menu is read-only."
        :update-function="updateRequiredFields"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuOrderContactField,
  MenuOrderTypeConfig,
} from '../../../../../../models/kitchen/menu/kitchen-menu.model'

type UpdateFn = (patch: Partial<MenuOrderTypeConfig>) => Promise<void>

const props = defineProps<{
  config: MenuOrderTypeConfig
  disabled?: boolean
  updateFunction: UpdateFn
}>()
const contactOptions: Array<{
  value: MenuOrderContactField
  label: string
  description: string
}> = [
  {
    value: 'name',
    label: 'Name',
    description: 'Identify the customer when the order is collected.',
  },
  {
    value: 'phone',
    label: 'Mobile number',
    description: 'Contact the customer about timing or a problem with the order.',
  },
  {
    value: 'email',
    label: 'Email address',
    description: 'Use an email address for order communication or receipts.',
  },
]
const allowedFields = new Set(contactOptions.map(option => option.value))
const handoffInstructions = computed(() =>
  String(props.config.fulfilment?.handoff_instructions || '')
)
const requiredFields = computed(() =>
  (props.config.customer?.required_fields || []).filter(field =>
    allowedFields.has(field)
  )
)

const updateHandoffInstructions = (value: string) =>
  props.updateFunction({
    fulfilment: {
      handoff_instructions: value,
    },
  })
const updateRequiredFields = (fields: string[]) =>
  props.updateFunction({
    customer: {
      required_fields: fields.filter(
        (field): field is MenuOrderContactField =>
          allowedFields.has(field as MenuOrderContactField)
      ),
    },
  })
</script>
