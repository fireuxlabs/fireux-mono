<template>
  <UCard v-if="isDev" class="fireux-debug-panel">
    <template #header>
      <div class="fireux-debug-panel__header">
        <div class="min-w-0">
          <div class="fireux-debug-panel__eyebrow-row">
            <span class="fireux-debug-panel__badge">FireUX debug</span>
            <span class="fireux-debug-panel__eyebrow">
              {{ scopeLabel }}
            </span>
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

    <template v-if="open">
      <pre class="fireux-debug-panel__json">{{ annotatedJsonString }}</pre>
    </template>
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
  | 'dev'
  | 'document'
  | 'index'
  | 'route'
  | 'runtime'

const props = withDefaults(
  defineProps<{
    title?: string
    scope?: FireuxDebugScope
    data?: unknown
    descriptions?: Record<string, string>
    defaultOpen?: boolean
  }>(),
  {
    title: 'Debug',
    scope: 'runtime',
    data: () => ({}),
    descriptions: () => ({}),
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
const annotatedJsonString = computed(() => {
  const descriptions = props.descriptions
  if (!Object.keys(descriptions).length) return jsonString.value

  const path: string[] = []
  return jsonString.value
    .split('\n')
    .map((line) => {
      const match = line.match(/^(\s*)"([^"]+)":/)
      if (!match) return line

      const depth = Math.floor(match[1].length / 2)
      path.length = depth - 1
      path[depth - 1] = match[2]
      const meaning = descriptions[path.join('.')]?.trim()
      return meaning ? `${line} // ${meaning}` : line
    })
    .join('\n')
})

const copyDebug = async () => {
  await copyText(jsonString.value, {
    label: props.title,
    success: 'Debug copied to clipboard',
  })
}
</script>

<style scoped>
.fireux-debug-panel {
  border: 1px solid var(--fx-debug-yellow-border);
  background:
    linear-gradient(135deg, var(--fx-debug-yellow-bg), transparent 44%),
    var(--ui-bg);
  font-size: var(--text-xs);
}

.fireux-debug-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.fireux-debug-panel__eyebrow-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.fireux-debug-panel__badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--fx-debug-yellow-border);
  border-radius: 9999px;
  background: var(--fx-debug-yellow-bg-strong);
  padding: 1px 7px;
  color: var(--fx-debug-ink);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
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
  color: var(--fx-debug-yellow-muted);
  font-size: 11px;
}

.fireux-debug-panel__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.fireux-debug-panel__title {
  color: var(--fx-debug-ink);
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
}

.fireux-debug-panel__json {
  border-top: 1px solid var(--fx-debug-yellow-border);
  background: var(--fx-debug-yellow-bg);
  padding: 10px 12px;
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
  font-size: 11px;
  color: var(--ui-text);
}

</style>
