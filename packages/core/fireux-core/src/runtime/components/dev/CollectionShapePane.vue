<template>
  <div v-if="enabled" class="mt-4 space-y-3">
    <h1 class="text-sm font-semibold">{{ summary }}</h1>

    <DevHealthPanel
      :title="title"
      :description="description"
      :checks="[check]"
    />

    <DevJsonPanel
      class="mt-3"
      :title="jsonTitle"
      :data="report"
      :default-open="defaultOpen"
    />
  </div>
</template>

<script setup lang="ts">
import type { DevHealthResult } from '../../composables/dev/health/types'

defineOptions({ name: 'DevCollectionShapePane' })

type Props = {
  enabled: boolean
  summary: string
  title: string
  description: string
  jsonTitle: string
  report: unknown
  check: DevHealthResult
  defaultOpen?: boolean
}

withDefaults(defineProps<Props>(), {
  defaultOpen: false,
})
</script>
