<template>
  <UFormField
    :label="fieldLabel('Name', nameRequired)"
    :required="nameRequired"
    :ui="fieldUi"
  >
    <UInput
      v-model="name"
      autocomplete="name"
      :disabled="pending"
      :maxlength="120"
      placeholder="Your name"
    />
  </UFormField>

  <UFormField
    :label="fieldLabel('Mobile number', phoneRequired)"
    :required="phoneRequired"
    :ui="fieldUi"
  >
    <UInput
      v-model="phone"
      autocomplete="tel"
      :disabled="pending"
      :maxlength="64"
      placeholder="079 123 45 67"
      type="tel"
    />
  </UFormField>

  <UFormField
    :label="fieldLabel('Email address', emailRequired)"
    :required="emailRequired"
    :ui="fieldUi"
  >
    <UInput
      v-model="email"
      autocomplete="email"
      :disabled="pending"
      :maxlength="254"
      placeholder="you@example.com"
      type="email"
    />
  </UFormField>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrderContactField } from '../../../kitchen/models/ordering.model'
const props = defineProps<{
  pending?: boolean
  requiredFields?: KitchenOrderContactField[]
}>()
const name = defineModel<string>('name', { required: true })
const phone = defineModel<string>('phone', { required: true })
const email = defineModel<string>('email', { required: true })
const required = computed(() => new Set(props.requiredFields || []))
const nameRequired = computed(() => required.value.has('name'))
const phoneRequired = computed(() => required.value.has('phone'))
const emailRequired = computed(() => required.value.has('email'))
const fieldUi = { label: 'menu-order-checkout__field-label' }
const fieldLabel = (label: string, required: boolean) =>
  required ? label : `${label} (optional)`
</script>
