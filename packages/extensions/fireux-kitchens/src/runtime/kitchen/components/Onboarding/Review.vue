<template>
  <!-- Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: review inherited versus overridden colours. -->
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: keep final Kitchen review factual and concise. -->
  <section class="form-stack-sm">
    <dl class="form-stack-sm">
      <div>
        <dt class="form-text-muted">Kitchen</dt>
        <dd>{{ place.name }}</dd>
      </div>
      <div v-if="place.formatted_address || place.short_address">
        <dt class="form-text-muted">Place</dt>
        <dd>{{ place.formatted_address || place.short_address }}</dd>
      </div>
      <div v-if="place.default_currency_code">
        <dt class="form-text-muted">Currency</dt>
        <dd>{{ place.default_currency_code }}</dd>
      </div>
      <div v-if="place.timezone">
        <dt class="form-text-muted">Timezone</dt>
        <dd>{{ place.timezone }}</dd>
      </div>
      <div>
        <dt class="form-text-muted">Directory</dt>
        <dd>{{ publicationLabel }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { computed } from 'vue'
import type { KitchenOnboardingPreview } from '../../models/kitchen-onboarding.model.ts'

const props = defineProps<{
  place: Place
  preview: KitchenOnboardingPreview
}>()

const publicationLabel = computed(() => {
  if (!props.preview.existing) return 'Draft — not published'
  return props.preview.published
    ? 'Published — preserved'
    : 'Not published — preserved'
})
</script>
