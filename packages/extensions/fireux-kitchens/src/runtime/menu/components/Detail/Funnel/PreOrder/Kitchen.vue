<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">Kitchen</h2>

    <p class="menu-order-step-label">Kitchen confirmation required</p>

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-mail"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Contacting kitchen</strong>
        <span>{{ kitchenStatus }}</span>
      </div>
    </section>

    <label class="menu-order-field">
      Email for confirmation
      <input
        v-model="email"
        autocomplete="email"
        class="menu-order-schedule__input"
        inputmode="email"
        placeholder="you@example.com"
        type="email"
      />
    </label>

    <div class="menu-order-dispatch__divider" />

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-clock"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Pre-order timing</strong>
        <span>{{ timingStatus }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import type { MenuOrderingFunnelController } from '../../../../models/menu-ordering.model.ts'
import { usePreOrderFunnel } from '../../../../../kitchen/composables/order/funnel/PreOrder/usePreOrderFunnel'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()
const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const { kitchenStatus, timingStatus } = usePreOrderFunnel(
  () => props.funnel.order
)
const email = ref(String(props.funnel.incoming.customer?.email ?? '').trim())
const emailReady = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
)
const ready = computed(() => emailReady.value)

watchEffect(() => {
  props.funnel.collect({
    customer: {
      email: email.value.trim(),
    },
  })
  emit('update:ready', ready.value)
})
</script>
