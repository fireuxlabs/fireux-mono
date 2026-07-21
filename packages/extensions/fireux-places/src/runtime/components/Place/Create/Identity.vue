<template>
  <!-- Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: present provider identity without browser-authored overrides. -->
  <section class="form-stack-sm">
    <UAlert
      v-if="existing"
      color="success"
      variant="soft"
      icon="i-lucide-circle-check"
      title="Already in FireUX"
      description="This shared Place will be reused without making a duplicate."
    />

    <dl class="form-stack-sm">
      <div>
        <dt class="form-text-muted">Place</dt>
        <dd>{{ place.name }}</dd>
      </div>
      <div>
        <dt class="form-text-muted">Address</dt>
        <dd>{{ address }}</dd>
      </div>
    </dl>

    <UAlert
      color="neutral"
      variant="soft"
      icon="i-lucide-shield-check"
      title="Provider-owned identity"
      description="The server independently verifies new Google Places. This screen does not overwrite canonical identity."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceUpsertInput } from '../../../models/place.model'

const props = defineProps<{
  place: PlaceUpsertInput
  existing: boolean
}>()

const address = computed(() =>
  String(
    props.place.formatted_address ||
    props.place.short_address ||
    'Physical location confirmed'
  ).trim()
)
</script>
