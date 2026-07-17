<template>
  <UCard>
    <template #header>
      <div>
        <h3 class="text-sm font-semibold text-highlighted">Payment methods</h3>
        <p class="text-sm text-dimmed">
          Choose how customers may pay for Collection orders.
        </p>
      </div>
    </template>

    <div class="space-y-5">
      <div class="grid gap-3 md:grid-cols-3">
        <label
          v-for="option in options"
          :key="option.value"
          class="flex cursor-pointer items-start gap-3 rounded-lg border border-default p-4"
        >
          <UCheckbox
            :model-value="draft.includes(option.value)"
            :disabled="disabled"
            @update:model-value="setMethod(option.value, $event === true)"
          />
          <span>
            <span class="block text-sm font-medium text-highlighted">{{ option.label }}</span>
            <span class="block text-xs leading-5 text-dimmed">{{ option.description }}</span>
          </span>
        </label>
      </div>

      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-info"
        title="Configuration only"
        description="The current Collection catalogue does not yet submit orders or take payment."
      />

    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type {
  MenuOrderTypeConfig,
  MenuPaymentMethod,
} from '../../../../../../models/kitchen/menu/kitchen-menu.model'

const props = defineProps<{
  config: MenuOrderTypeConfig
  disabled?: boolean
}>()
const emit = defineEmits<{
  (event: 'save', config: MenuOrderTypeConfig): void
}>()
const options: Array<{
  value: MenuPaymentMethod
  label: string
  description: string
}> = [
  {
    value: 'cash',
    label: 'Cash at pickup',
    description: 'Pay when collecting the order.',
  },
  {
    value: 'card_at_pickup',
    label: 'Card at pickup',
    description: 'Use the Kitchen card terminal.',
  },
  {
    value: 'online_card',
    label: 'Online card',
    description: 'Ready for a later checkout pass.',
  },
]
const allowedMethods = new Set(options.map(option => option.value))
const draft = ref<MenuPaymentMethod[]>([])

watch(
  () => props.config.fulfilment?.payment_methods,
  (methods: MenuPaymentMethod[] | undefined) => {
    draft.value = (methods || []).filter((method: MenuPaymentMethod) =>
      allowedMethods.has(method)
    )
  },
  { immediate: true, deep: true }
)

function setMethod(method: MenuPaymentMethod, enabled: boolean) {
  draft.value = enabled
    ? [...new Set([...draft.value, method])]
    : draft.value.filter((value: MenuPaymentMethod) => value !== method)
  emit('save', {
    ...props.config,
    fulfilment: {
      ...props.config.fulfilment,
      payment_methods: options
        .map(option => option.value)
        .filter(method => draft.value.includes(method)),
    },
  })
}
</script>
