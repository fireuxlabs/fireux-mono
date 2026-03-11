<template>
  <PortfolioCreateForm
    :return-to="returnTo"
    :cancel-to="cancelTo"
    @created="$emit('created', $event)"
  />
</template>

<script setup lang="ts">
import PortfolioCreateForm from './Form.vue'

defineProps<{
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (event: 'created', portfolioId: string): void
}>()
</script>
