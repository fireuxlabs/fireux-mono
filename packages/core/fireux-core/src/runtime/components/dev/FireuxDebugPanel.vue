<template>
  <UCard v-if="isDev" class="fireux-debug-panel">
    <template #header>
      <div class="fireux-debug-panel__header">
        <div class="min-w-0">
          <div class="fireux-debug-panel__eyebrow">
            {{ scopeLabel }}
          </div>
          <div class="fireux-debug-panel__title">
            {{ title }}
          </div>
          <div class="fireux-debug-panel__meta">
            {{ dataKindLabel }} · {{ dataSizeLabel }}
          </div>
        </div>

        <div class="fireux-debug-panel__actions">
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-copy"
            :loading="copying"
            @click="copyDebug"
          >
            Copy
          </UButton>

          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            :icon="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            @click="open = !open"
          >
            {{ open ? 'Hide' : 'Show' }}
          </UButton>
        </div>
      </div>
    </template>

    <pre v-if="open" class="fireux-debug-panel__json">{{ jsonString }}</pre>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'
import { useDevDebugData } from '../../composables/dev/useDevDebugData'

defineOptions({ name: 'FireuxDebugPanel' })

type FireuxDebugScope =
  | 'console'
  | 'collection'
  | 'document'
  | 'index'
  | 'route'
  | 'runtime'

const props = withDefaults(
  defineProps<{
    title?: string
    scope?: FireuxDebugScope
    data?: unknown
    defaultOpen?: boolean
  }>(),
  {
    title: 'Debug',
    scope: 'runtime',
    data: null,
    defaultOpen: false,
  }
)

const isDev = import.meta.dev
const open = ref(props.defaultOpen)
const { copying, copyText } = useDevClipboard()
const { dataKindLabel, dataSizeLabel, jsonString } = useDevDebugData(
  computed(() => props.data),
  {
    stringifyErrorMessage: '[FireuxDebugPanel] Unable to stringify data',
    treatEmptyContainersAsEmpty: false,
  }
)
const scopeLabel = computed(() => `${props.scope} debug`)

const copyDebug = () =>
  copyText(jsonString.value, {
    label: props.title,
    success: 'Debug copied to clipboard',
  })
</script>

<style scoped>
.fireux-debug-panel {
  font-size: 12px;
  opacity: 0.82;
}

.fireux-debug-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.fireux-debug-panel__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.fireux-debug-panel__eyebrow,
.fireux-debug-panel__meta {
  color: var(--ui-text-muted);
  font-size: 11px;
}

.fireux-debug-panel__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.fireux-debug-panel__title {
  color: var(--ui-text);
  font-size: 13px;
  font-weight: 600;
}

.fireux-debug-panel__json {
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
  font-size: 11px;
  color: var(--ui-text-muted);
}
</style>
