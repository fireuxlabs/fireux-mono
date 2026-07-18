<template>
  <UCard>
    <template #header>
      <div>
        <h3 class="text-sm font-semibold text-highlighted">Payment</h3>
        <p class="text-sm text-dimmed">
          Configure the settlement methods behind Pay now and Pay when you collect.
        </p>
      </div>
    </template>

    <div class="grid gap-5">
      <MoleculesFormsFirestoreChoiceGroup
        label="Accepted payment methods"
        empty-label="No Collection payment methods configured"
        :firebase-value="paymentMethods"
        :options="options"
        :disabled="disabled"
        disabled-message="This menu is read-only."
        :update-function="updatePaymentMethods"
      />

      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-info"
        title="Guest payment choices"
        description="Online card becomes Pay now. Cash and terminal methods are grouped into one Pay when you collect choice."
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuOrderTypeConfig,
  MenuPaymentMethod,
} from '../../../../../../models/kitchen/menu/kitchen-menu.model'

type UpdateFn = (patch: Partial<MenuOrderTypeConfig>) => Promise<void>

const props = defineProps<{
  config: MenuOrderTypeConfig
  disabled?: boolean
  updateFunction: UpdateFn
}>()
const options: Array<{
  value: MenuPaymentMethod
  label: string
  description: string
}> = [
  {
    value: 'cash',
    label: 'Cash at pickup',
    description: 'The customer can settle with cash when collecting.',
  },
  {
    value: 'card_at_pickup',
    label: 'Card at pickup',
    description: 'The customer can use the Kitchen card terminal.',
  },
  {
    value: 'online_card',
    label: 'Online card',
    description: 'The customer can choose Pay now and open secure checkout.',
  },
]
const allowedMethods = new Set(options.map(option => option.value))
const paymentMethods = computed(() =>
  (props.config.fulfilment?.payment_methods || []).filter(method =>
    allowedMethods.has(method)
  )
)

const updatePaymentMethods = (methods: string[]) =>
  props.updateFunction({
    fulfilment: {
      payment_methods: methods.filter(
        (method): method is MenuPaymentMethod =>
          allowedMethods.has(method as MenuPaymentMethod)
      ),
    },
  })
</script>
