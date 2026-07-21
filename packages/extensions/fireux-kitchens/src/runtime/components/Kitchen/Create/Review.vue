<template>
  <!-- Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: review sparse Kitchen truth and inherited Place defaults. -->
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
import { computed } from 'vue'
import type { KitchenOnboardingPreview } from '../../../models/kitchen-onboarding.model'

const props = defineProps<{
  place: PublicPlaceDetailProjection
  preview: KitchenOnboardingPreview
  effectiveName: string
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
