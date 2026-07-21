<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw console debug label. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: delegate selected-target chrome to Core. -->
<template>
  <ConsoleSelectedTarget
    label="Property"
    :selected-id="propertyId"
    :description="propertyName"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Property } from '../../../../models/property.model'

const props = defineProps<{
  property?: Property | null
  propertyId?: string
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const propertyName = computed(() =>
  String(props.property?.identity?.name || props.property?.slug || '').trim()
)
</script>
