<template>
  <section class="space-y-4">
    <PlaceClaimPanel :place="place" :id="id" :locator="locator" />
  </section>
</template>

<script setup lang="ts">
import type { Place } from '../../models/place.model'

defineProps<{
  place: Place | null
  id: string
  locator?: string
}>()
</script>
