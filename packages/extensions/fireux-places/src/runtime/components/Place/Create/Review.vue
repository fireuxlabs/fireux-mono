<template>
  <!-- Concurrent edit — 2026-07-22 12:27 CEST — Place palette onboarding: review sparse shared colours and optional branding. -->
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
      <div v-if="currencyCode">
        <dt class="form-text-muted">Currency</dt>
        <dd>{{ currencyCode }}</dd>
      </div>
      <div v-if="timezone">
        <dt class="form-text-muted">Timezone</dt>
        <dd>{{ timezone }}</dd>
      </div>
      <div>
        <dt class="form-text-muted">Logo</dt>
        <dd>{{ logoLabel }}</dd>
      </div>
      <div>
        <dt class="form-text-muted">Colours</dt>
        <dd>{{ paletteLabel }}</dd>
      </div>
    </dl>

    <UAlert
      v-if="existing && !configuring"
      color="success"
      variant="soft"
      icon="i-lucide-refresh-cw"
      title="Reuse this Place"
      description="No duplicate will be created and the existing Place will not be overwritten."
    />

    <UAlert
      v-else-if="existing"
      color="neutral"
      variant="soft"
      icon="i-lucide-list-checks"
      title="Finish this Place"
      description="Only missing defaults and optional branding will be added. Existing Place truth will not be overwritten."
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-badge-check"
      title="Verify and add"
      description="FireUX will verify the Google identity again, then save the confirmed defaults through the trusted Place boundary."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceUpsertInput } from '../../../models/place.model'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/core/style.model'

const props = defineProps<{
  place: PlaceUpsertInput
  existing: boolean
  configuring: boolean
  currencyCode: string
  timezone: string
  logoStaged: boolean
  brandPalette: SparseBrandPalette
}>()

const address = computed(() =>
  String(
    props.place.formatted_address ||
    props.place.short_address ||
    'Physical location confirmed'
  ).trim()
)

const logoLabel = computed(() => {
  if (props.logoStaged) return 'Ready to upload'
  if (String(props.place.image_url || '').trim()) return 'Existing logo'
  return 'Skipped for now'
})

const paletteLabel = computed(() => {
  const count = Object.keys(props.brandPalette).length
  return count ? `${count} Place colour${count === 1 ? '' : 's'}` : 'FireUX defaults'
})
</script>
