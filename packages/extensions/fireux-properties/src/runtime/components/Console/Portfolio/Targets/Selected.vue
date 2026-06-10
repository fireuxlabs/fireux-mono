<template>
  <UPageCard
    v-if="portfolioId"
    title="Selected Portfolio"
    :description="portfolioName || portfolioId"
    variant="subtle"
  >
    <template #footer>
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-x"
        @click="emit('clear')"
      >
        Clear
      </UButton>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioConsoleEntity } from '../../../../composables/fireux/console/portfolio/usePortfolioConsole'

const props = defineProps<{
  portfolio?: PortfolioConsoleEntity | null
  portfolioId?: string
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const portfolioName = computed(() =>
  String(props.portfolio?.name || props.portfolio?.slug || '').trim()
)
</script>
