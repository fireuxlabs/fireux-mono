<template>
  <!-- Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: review inherited versus overridden colours. -->
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

    <UAlert
      :color="alertColor"
      variant="soft"
      :icon="alertIcon"
      :title="alertTitle"
      :description="alertDescription"
    />
  </section>
</template>

<script setup lang="ts">
import type { PublicPlaceDetailProjection } from 'fireux-places/runtime/models/place-public.model'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/core/style.model'
import { computed } from 'vue'
import type { KitchenOnboardingPreview } from '../../../models/kitchen-onboarding.model'

const props = defineProps<{
  place: PublicPlaceDetailProjection
  preview: KitchenOnboardingPreview
  effectiveName: string
  paletteOverride: SparseBrandPalette
  inheritedPalette: SparseBrandPalette
}>()

const alertColor = computed(() =>
  props.preview.can_complete ? 'neutral' : 'warning'
)
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
const alertIcon = computed(() => {
  if (!props.preview.can_complete) return 'i-lucide-lock-keyhole'
  if (props.preview.action === 'create') return 'i-lucide-plus-circle'
  if (props.preview.action === 'connect') return 'i-lucide-plug-zap'
  return 'i-lucide-circle-check'
})
const alertTitle = computed(() => {
  if (!props.preview.can_complete) return 'Kitchen access required'
  if (props.preview.action === 'create') return 'Create one Kitchen'
  if (props.preview.action === 'connect') return 'Connect this Kitchen'
  return 'Kitchen already connected'
})
const alertDescription = computed(() => {
  if (!props.preview.can_complete) {
    return props.preview.message || 'Ask an App admin or Kitchen operator for access.'
  }
  if (props.preview.action === 'create') {
    return 'The Kitchen starts unpublished and inherits shared defaults from its Place.'
  }
  if (props.preview.action === 'connect') {
    return 'The existing Kitchen identity is preserved while console access is added.'
  }
  return 'No duplicate will be created. This Kitchen will be selected in your console.'
})
</script>
