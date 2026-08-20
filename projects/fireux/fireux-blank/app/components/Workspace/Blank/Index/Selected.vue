<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw workspace debug label. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: delegate selected-target chrome to Core. -->
<template>
  <WorkspaceSelectedTarget
    label="Blank"
    :selected-id="blankId"
    :description="blankName"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Blank } from '../../../../models/blank.model'

const props = defineProps<{
  blank?: Blank | null
  blankId?: string
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const blankName = computed(() =>
  String(props.blank?.name || props.blank?.slug || '').trim()
)
</script>
