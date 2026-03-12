<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Portfolio details</div>
        <div class="text-xs text-dimmed">
          Portfolios group property operations, finance, compliance, and documents.
        </div>
      </div>
    </template>

    <PortfolioCreateForm
      :return-to="returnTo"
      :cancel-to="cancelTo"
      @created="$emit('created', $event)"
    />
  </UCard>
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
