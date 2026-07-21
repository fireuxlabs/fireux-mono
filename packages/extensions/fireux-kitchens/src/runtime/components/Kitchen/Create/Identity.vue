<template>
  <!-- Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: keep identity as an optional Place-name override. -->
  <section class="form-stack-sm">
    <dl class="form-stack-sm">
      <div>
        <dt class="form-text-muted">Place</dt>
        <dd>{{ place.name }}</dd>
      </div>
      <div v-if="place.short_address">
        <dt class="form-text-muted">Address</dt>
        <dd>{{ place.short_address }}</dd>
      </div>
    </dl>

    <UFormField
      label="Kitchen name override"
      hint="Optional"
      description="Leave this blank to use the Place name everywhere."
    >
      <UInput
        :model-value="displayName"
        :placeholder="place.name"
        :disabled="!editable"
        maxlength="120"
        @update:model-value="emit('update:displayName', String($event ?? ''))"
      />
    </UFormField>

    <UAlert
      v-if="!editable"
      color="success"
      variant="soft"
      icon="i-lucide-circle-check"
      title="Existing Kitchen identity"
      description="Connecting this Kitchen will not overwrite its stored identity."
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-layers-3"
      title="Place defaults stay shared"
      description="Address, logo, currency, timezone, contact details, and business hours remain on the Place."
    />
  </section>
</template>

<script setup lang="ts">
import type { PublicPlaceDetailProjection } from 'fireux-places/runtime/models/place-public.model'

defineProps<{
  place: PublicPlaceDetailProjection
  displayName: string
  editable: boolean
}>()

const emit = defineEmits<{
  (event: 'update:displayName', value: string): void
}>()
</script>
