<template>
  <section class="space-y-2">
    <pre>ConsolePortfolioTargetsSelected</pre>

    <UPageCard
      v-if="portfolioId"
      :title="selectedTitle"
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

    <UPageCard
      v-else
      title="No selected Portfolio"
      description="Choose a live or demo Portfolio target to open selected Portfolio console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import type { PortfolioConsoleEntity } from '../../../../composables/fireux/console/portfolio/usePortfolioConsole'

const props = defineProps<{
  portfolio?: PortfolioConsoleEntity | null
  portfolioId?: string
  mode?: ConsoleMode
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const portfolioName = computed(() =>
  String(props.portfolio?.name || props.portfolio?.slug || '').trim()
)
const selectedTitle = computed(() =>
  props.mode === 'demo' ? 'Selected Demo Portfolio' : 'Selected Portfolio'
)
</script>
