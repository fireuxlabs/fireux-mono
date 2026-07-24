<template>
  <h1>{{ copy('sell') }}</h1>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'

const { copy } = useInterlakenCopy()
</script>
