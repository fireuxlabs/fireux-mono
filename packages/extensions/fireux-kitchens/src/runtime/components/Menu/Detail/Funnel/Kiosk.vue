<template>
  <MenuDetailFunnelBasketStep
    v-if="step === 1"
    :funnel="funnel"
  />

  <ClientOnly v-else-if="step === 2">
    <MenuDetailFunnelAllergen v-model="allergenAccepted" />
  </ClientOnly>

  <div v-else-if="step === 3" class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Kiosk
    </h2>

    <UFormField label="Name for the counter call">
      <UInput
        v-model="callName"
        autocomplete="given-name"
        placeholder="Daniel"
        size="lg"
      />
    </UFormField>

    <section class="rounded-lg border border-default bg-muted/40 p-3">
      <div class="flex items-start gap-3">
        <UIcon
          :name="modeIcon"
          class="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />

        <div class="grid gap-0.5">
          <strong class="text-sm font-black text-highlighted">
            {{ modeLabel }}
          </strong>
          <span class="text-sm font-semibold text-muted">
            {{ handoffLabel }}
          </span>
        </div>
      </div>
    </section>
  </div>

  <MenuDetailFunnelConfirmation
    v-else-if="step === 4"
    :funnel="funnel"
  />
</template>

<script setup lang="ts">
import {
  computed,
  watchEffect,
} from 'vue'
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
  step: number
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const cleanName = (value: unknown) => String(value ?? '').trim()
const isEatIn = computed(() => props.funnel.order.orderType === 'eat_in')
const allergenAccepted = computed({
  get: () => Boolean(props.funnel.incoming.allergen_checked),
  set: (accepted: boolean) => {
    props.funnel.collect({
      allergen_checked: accepted,
    })
  },
})
const callName = computed({
  get: () => cleanName(props.funnel.incoming.customer?.name),
  set: (name: string) => {
    props.funnel.collect({
      customer: {
        ...props.funnel.incoming.customer,
        name,
      },
    })
  },
})
const modeIcon = computed(() =>
  isEatIn.value ? 'i-lucide-utensils' : 'i-lucide-shopping-bag'
)
const modeLabel = computed(() =>
  isEatIn.value ? 'Eat in' : 'Takeaway'
)
const handoffLabel = computed(() =>
  isEatIn.value
    ? 'Collect a tray from the counter when called.'
    : 'Collect a bag from the counter when called.'
)

watchEffect(() => {
  if (props.step === 2) {
    emit('update:ready', allergenAccepted.value)
    return
  }
  if (props.step === 3) {
    emit('update:ready', Boolean(callName.value))
    return
  }

  emit('update:ready', true)
})
</script>
