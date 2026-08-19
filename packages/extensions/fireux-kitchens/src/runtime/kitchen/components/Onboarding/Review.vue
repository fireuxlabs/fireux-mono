<template>
  <!-- Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: review inherited versus overridden colours. -->
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: keep final Kitchen review factual and concise. -->
  <section class="form-stack-sm">
    <dl class="form-stack-sm">
      <div>
        <dt class="form-text-muted">Kitchen</dt>
        <dd>{{ effectiveName }}</dd>
      </div>
      <div>
        <dt class="form-text-muted">Place</dt>
        <dd>{{ place.name }}</dd>
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
      <div>
        <dt class="form-text-muted">Colours</dt>
        <dd>{{ paletteLabel }}</dd>
      </div>
    </dl>

  </section>
</template>

<script setup lang="ts">
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import { computed } from 'vue'
import type { KitchenOnboardingPreview } from '../../models/kitchen-onboarding.model.ts'

const props = defineProps<{
  place: Place
  preview: KitchenOnboardingPreview
  effectiveName: string
  paletteOverride: SparseBrandPalette
  inheritedPalette: SparseBrandPalette
}>()

const publicationLabel = computed(() => {
  if (!props.preview.existing) return 'Draft — not published'
  return props.preview.published
    ? 'Published — preserved'
    : 'Not published — preserved'
})
const paletteLabel = computed(() => {
  const count = Object.keys(props.paletteOverride).length
  if (count) return `${count} Kitchen override${count === 1 ? '' : 's'}`
  return Object.keys(props.inheritedPalette).length
    ? 'Inherited from Place'
    : 'FireUX defaults'
})
</script>
