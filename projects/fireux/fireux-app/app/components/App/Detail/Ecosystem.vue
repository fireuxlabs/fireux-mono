<template>
  <UCard>
    <template #header>Ecosystem</template>
    <ULink :to="`/ecosystems/${encodeURIComponent(ecosystem.id)}`">{{
      ecosystem.name
    }}</ULink>
    <p class="fx-type-caption">{{ ecosystem.description }}</p>
  </UCard>
</template>

<script setup lang="ts">
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'

defineProps<{ ecosystem: Ecosystem }>()
</script>
