<template>
  <section class="space-y-3">
    <UCard class="space-y-4">
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ title }}
            </p>
            <p
              v-if="description"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              {{ description }}
            </p>
          </div>
          <div v-if="$slots.actions" class="flex items-center gap-2">
            <slot name="actions" />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <slot />

        <DevHealth
          v-if="effectiveChecks.length"
          :title="healthTitle"
          :description="healthDescription"
          :checks="effectiveChecks"
        />
        <slot name="health" />

        <DevJson
          v-if="debugData != null"
          :title="debugTitle || 'Debug data'"
          :data="debugData"
          :default-open="defaultOpen"
        />
        <slot name="debug" />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue'
import type { ComputedRef } from 'vue'
import DevHealth from './DevHealth.vue'
import DevJson from './DevJson.vue'
import type { DevHealthResult } from '../../composables/dev/health/types'

defineOptions({ name: 'DevPane' })

interface Props {
  title: string
  description?: string
  checks?: DevHealthResult[] | ComputedRef<DevHealthResult[]>
  healthTitle?: string
  healthDescription?: string
  debugTitle?: string
  debugData?: unknown
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  checks: () => [],
  healthTitle: 'Health checks',
  healthDescription: 'Integrity checks for this scope.',
  debugTitle: 'Debug data',
  defaultOpen: false,
})

const effectiveChecks = computed<DevHealthResult[]>(() => {
  const raw = unref(props.checks) || []
  return Array.isArray(raw) ? raw.filter(Boolean) : []
})
</script>
