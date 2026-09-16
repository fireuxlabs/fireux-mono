<template>
  <UCard>
    <template #header>
      <div>
        <h3 class="text-sm font-semibold text-highlighted">
          {{ serviceLabel }} details
        </h3>
      </div>
    </template>

    <div class="grid gap-5">
      <MoleculesFormsEditableSimpleField
        :label="handoffLabel"
        type="textarea"
        :rows="2"
        :maxlength="240"
        :value="handoffInstructions"
        :placeholder="handoffPlaceholder"
        :disabled="disabled"
        disabled-message="This Kitchen is read-only."
        :update="updateHandoffInstructions"
      />

      <MoleculesFormsEditableChoiceGroup
        label="Required customer details"
        empty-label="All contact details are optional"
        :value="requiredFields"
        :options="contactOptions"
        :disabled="disabled"
        disabled-message="This Kitchen is read-only."
        :update="updateRequiredFields"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  KitchenOrderContactField,
  KitchenOrderTypeConfig,
} from '../../../models/ordering.model'

type UpdateFn = (patch: Partial<KitchenOrderTypeConfig>) => Promise<void>

const props = defineProps<{
  config: KitchenOrderTypeConfig
  disabled?: boolean
  handoffLabel: string
  handoffPlaceholder: string
  serviceLabel: string
  updateFunction: UpdateFn
}>()
const contactOptions: Array<{
  value: KitchenOrderContactField
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
    description:
      'Contact the customer about timing or a problem with the order.',
  },
  {
    value: 'email',
    label: 'Email address',
    description: 'Use an email address for order communication or receipts.',
  },
]
const allowedFields = new Set(contactOptions.map((option) => option.value))
const handoffInstructions = computed(() =>
  String(props.config.fulfilment?.handoff_instructions || '')
)
const requiredFields = computed(() =>
  (props.config.customer?.required_fields || []).filter((field) =>
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
        (field): field is KitchenOrderContactField =>
          allowedFields.has(field as KitchenOrderContactField)
      ),
    },
  })
</script>
