<script setup lang="ts">
import { useApiRead } from 'fireux-core/runtime/composables/http/useApiRead'
const { data, error } = await useApiRead('named-database-probe', ({ fetch }) =>
  fetch('/api/__fixture/named')
)
</script>

<template>
  <p data-testid="named-databases">
    {{ error ? String(error) : JSON.stringify(data) }}
  </p>
</template>
