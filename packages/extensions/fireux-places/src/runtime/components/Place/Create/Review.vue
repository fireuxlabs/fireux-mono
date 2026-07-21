<template>
  <!-- Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: isolate the final idempotent Place review. -->
  <section class="form-stack-sm">
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
      v-if="existing"
      color="success"
      variant="soft"
      icon="i-lucide-refresh-cw"
      title="Reuse this Place"
      description="No duplicate will be created and the existing Place will not be overwritten."
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-badge-check"
      title="Verify and add"
      description="FireUX will verify the Google identity again on the server, then add the Place only if it is missing."
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
