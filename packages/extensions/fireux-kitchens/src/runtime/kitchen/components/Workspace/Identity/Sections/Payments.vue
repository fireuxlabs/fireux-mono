<!-- Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: edit Kitchen payment applicability by order type. -->
<template>
  <MoleculesDisclosurePanel
    title="Payments"
    description="Choose which payment methods this Kitchen accepts for each ordering doorway."
    icon="i-lucide-wallet-cards"
    :default-open="false"
  >
    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <UCard v-for="group in groups" :key="group.id">
        <p class="mb-3 text-sm text-dimmed">
          {{ group.description }}
        </p>

        <MoleculesFormsEditableChoiceGroup
          :label="group.label"
          :value="methodsFor(group.orderTypes)"
          :options="group.options"
          :disabled="!canWrite"
          disabled-message="This kitchen is read-only."
          :empty-label="`No ${group.label.toLowerCase()} payment methods configured`"
          :update="updateFunctions[group.id]"
        />
      </UCard>
    </div>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenFulfilmentUpdate } from '../../../../composables/workspace/identity/mutations/useKitchenFulfilmentUpdate'
import type {
  KitchenFulfilmentPaymentMethod,
  KitchenFulfilmentPaymentPolicy,
} from '../../../../models/fulfilment.model.ts'
import type { KitchenOrderType } from '../../../../utils/order.ts'
import { readKitchenFulfilmentConfig } from '../../../../utils/kitchen-readers'

type PaymentGroup = {
  id:
    | 'collection'
    | 'delivery'
    | 'pre_order'
    | 'room_service'
    | 'dine_in'
    | 'counter'
  label: string
  description: string
  orderTypes: KitchenOrderType[]
  options: Array<{
    value: KitchenFulfilmentPaymentMethod
    label: string
    description: string
  }>
}

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}>()

const groups: PaymentGroup[] = [
  {
    id: 'collection',
    label: 'Collection',
    description: 'Payment methods offered when a customer collects an order.',
    orderTypes: ['collection'],
    options: [
      { value: 'cash', label: 'Cash', description: 'Pay with cash at pickup.' },
      {
        value: 'card_at_pickup',
        label: 'Card at pickup',
        description: 'Use the Kitchen terminal.',
      },
      {
        value: 'online_card',
        label: 'Online card',
        description: 'Pay securely before pickup.',
      },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    description: 'Payment methods offered when the Kitchen sends an order out.',
    orderTypes: ['delivery'],
    options: [
      {
        value: 'cash',
        label: 'Cash',
        description: 'Pay the driver with cash.',
      },
      {
        value: 'card_to_driver',
        label: 'Card to driver',
        description: 'Use the driver terminal.',
      },
      {
        value: 'online_card',
        label: 'Online card',
        description: 'Pay securely before delivery.',
      },
    ],
  },
  {
    id: 'pre_order',
    label: 'Pre-order',
    description: 'Payment methods offered for orders placed ahead.',
    orderTypes: ['pre_order'],
    options: [
      {
        value: 'cash',
        label: 'Cash',
        description: 'Pay when the order is fulfilled.',
      },
      {
        value: 'card_at_pickup',
        label: 'Card at pickup',
        description: 'Use the Kitchen terminal.',
      },
      {
        value: 'online_card',
        label: 'Online card',
        description: 'Pay securely when ordering.',
      },
    ],
  },
  {
    id: 'room_service',
    label: 'Room service',
    description:
      'Room charging remains exclusive to a verified room-service doorway.',
    orderTypes: ['room_service'],
    options: [
      {
        value: 'room_charge',
        label: 'Charge to room',
        description: 'Requires verified room context.',
      },
      {
        value: 'online_card',
        label: 'Online card',
        description: 'Pay securely when ordering.',
      },
    ],
  },
  {
    id: 'dine_in',
    label: 'Dine-in',
    description: 'Payment methods offered for table-service orders.',
    orderTypes: ['dine_in'],
    options: [
      {
        value: 'cash',
        label: 'Cash',
        description: 'Settle during table service.',
      },
      {
        value: 'online_card',
        label: 'Online card',
        description: 'Pay securely when ordering.',
      },
    ],
  },
  {
    id: 'counter',
    label: 'Kiosk / counter',
    description: 'Shared payment policy for eat-in and takeaway kiosk choices.',
    orderTypes: ['eat_in', 'takeaway'],
    options: [
      { value: 'cash', label: 'Cash', description: 'Pay at the counter.' },
      {
        value: 'card_at_pickup',
        label: 'Card at counter',
        description: 'Use the Kitchen terminal.',
      },
      {
        value: 'online_card',
        label: 'Online card',
        description: 'Pay securely when ordering.',
      },
    ],
  },
]

const collectionPath = computed(() => props.collectionPath)
const { updateKitchenFulfilment } = useKitchenFulfilmentUpdate()
const fulfilment = computed(() => readKitchenFulfilmentConfig(props.kitchen))

const methodsFor = (orderTypes: KitchenOrderType[]) =>
  fulfilment.value.payment_methods
    .filter((policy) =>
      orderTypes.every((type) => policy.order_types.includes(type))
    )
    .map((policy) => policy.method)

let updateQueue = Promise.resolve()

const updateGroup = (group: PaymentGroup, selectedMethods: string[]) => {
  if (!props.canWrite || !props.kitchenId) {
    return Promise.reject(new Error('This kitchen is read-only.'))
  }

  const selected = new Set(
    selectedMethods.filter((method): method is KitchenFulfilmentPaymentMethod =>
      group.options.some((option) => option.value === method)
    )
  )
  const groupTypes = new Set(group.orderTypes)

  updateQueue = updateQueue.then(async () => {
    const current = readKitchenFulfilmentConfig(props.kitchen)
    const policies = new Map(
      current.payment_methods.map((policy) => [policy.method, policy] as const)
    )

    for (const option of group.options) {
      const existing = policies.get(option.value)
      const orderTypes = (existing?.order_types || []).filter(
        (type) => !groupTypes.has(type)
      )

      if (selected.has(option.value)) orderTypes.push(...group.orderTypes)

      if (orderTypes.length) {
        policies.set(option.value, {
          method: option.value,
          order_types: [...new Set(orderTypes)],
          ...(option.value === 'room_charge'
            ? { requirements: ['verified_room'] as const }
            : existing?.requirements?.length
              ? { requirements: existing.requirements }
              : {}),
        })
      } else {
        policies.delete(option.value)
      }
    }

    const paymentMethods: KitchenFulfilmentPaymentPolicy[] = [
      ...policies.values(),
    ]
    await updateKitchenFulfilment({
      kitchenId: props.kitchenId,
      changes: { payment_methods: paymentMethods },
    })
  })

  return updateQueue
}

const updateFunctions = Object.fromEntries(
  groups.map((group) => [
    group.id,
    (methods: string[]) => updateGroup(group, methods),
  ])
) as Record<PaymentGroup['id'], (methods: string[]) => Promise<void>>
</script>
