<template>
  <!-- Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: keep identity as an optional Place-name override. -->
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: ask only whether this Kitchen needs its own name. -->
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
      label="Kitchen name"
      hint="Optional"
      description="Leave blank to use the Place name."
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
      title="Kitchen found"
    />
  </section>
</template>

<script setup lang="ts">
import type { Place } from 'fireux-places/runtime/place/models/place.model'

defineProps<{
  place: Place
  displayName: string
  editable: boolean
}>()

const emit = defineEmits<{
  (event: 'update:displayName', value: string): void
}>()
</script>
