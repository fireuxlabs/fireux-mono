<template>
  <div v-if="shouldRender">
    <div
      v-if="!panelVisible"
      class="jsonpanel-launcher"
    >
      <UButton
        icon="i-heroicons-code-bracket-square"
        size="xs"
        variant="ghost"
        aria-label="Show dev JSON panel"
        @click="openPanel"
      />
    </div>
    <div v-else class="jsonpanel-panel">
      <div class="jsonpanel-header">
        <div>
          <h2 class="jsonpanel-title">{{ title }}</h2>
          <p class="jsonpanel-context">{{ context }}</p>
          <p class="jsonpanel-meta">
            {{ dataKindLabel }} · {{ dataSizeLabel }}
          </p>
        </div>
        <div class="jsonpanel-actions">
          <UButton
            icon="i-heroicons-clipboard-document"
            size="sm"
            variant="outline"
            :disabled="copying"
            @click="onCopy"
          >
            {{ copyLabel }}
          </UButton>
          <UButton
            :icon="expanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
            size="sm"
            variant="ghost"
            @click="expanded = !expanded"
          >
            {{ expanded ? 'Hide' : 'Show' }} JSON
          </UButton>
          <UButton
            icon="i-heroicons-x-mark"
            size="sm"
            variant="ghost"
            @click="panelVisible = false"
          />
        </div>
      </div>
      <div v-if="expanded">
        <div
          v-if="showObjectPreview"
          class="jsonpanel-object-preview"
        >
          <div
            v-for="entry in objectPreviewEntries"
            :key="entry.key"
            class="jsonpanel-object-row"
          >
            <span class="jsonpanel-object-key">{{ entry.key }}</span>
            <span class="jsonpanel-object-value">{{ entry.value }}</span>
          </div>
        </div>
        <pre>{{ jsonString }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'

defineOptions({ name: 'Json' })

// TODO: Enforce strong, descriptive context strings for all DevJson usages.
interface JsonPanelProps {
  data: unknown
  context: string
  title?: string
  defaultOpen?: boolean
  hideWhenEmpty?: boolean
}

const props = withDefaults(defineProps<JsonPanelProps>(), {
  title: 'JSON',
  defaultOpen: false,
  hideWhenEmpty: true,
})

const expanded = ref(props.defaultOpen)
const panelVisible = ref(props.defaultOpen)
const isEmpty = computed(() => {
  const value = props.data as any
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  if (typeof value === 'string') return value.length === 0
  return false
})

const shouldRender = computed(() => !props.hideWhenEmpty || !isEmpty.value)
const dataKind = computed<'array' | 'object' | 'primitive' | 'empty'>(() => {
  if (isEmpty.value) return 'empty'
  if (Array.isArray(props.data)) return 'array'
  if (typeof props.data === 'object' && props.data !== null) return 'object'
  return 'primitive'
})
const dataKindLabel = computed(() => {
  if (dataKind.value === 'array') return 'Collection'
  if (dataKind.value === 'object') return 'Object'
  if (dataKind.value === 'primitive') return 'Primitive'
  return 'Empty'
})
const dataSizeLabel = computed(() => {
  if (dataKind.value === 'array') return `${(props.data as unknown[]).length} items`
  if (dataKind.value === 'object') return `${Object.keys(props.data as Record<string, unknown>).length} keys`
  if (dataKind.value === 'primitive') return '1 value'
  return '0'
})

const summarizeValue = (value: unknown): string => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return `Array(${value.length})`
  if (typeof value === 'object') {
    return `Object(${Object.keys(value as Record<string, unknown>).length})`
  }
  if (typeof value === 'string') {
    const normalized = value.trim()
    if (!normalized) return '""'
    const clipped = normalized.length > 72 ? `${normalized.slice(0, 72)}…` : normalized
    return `"${clipped}"`
  }
  return String(value)
}

const objectPreviewEntries = computed(() => {
  if (dataKind.value !== 'object') return [] as Array<{ key: string; value: string }>
  const source = props.data as Record<string, unknown>
  return Object.keys(source)
    .slice(0, 18)
    .map((key) => ({
      key,
      value: summarizeValue(source[key]),
    }))
})
const showObjectPreview = computed(
  () => dataKind.value === 'object' && objectPreviewEntries.value.length > 0
)

const jsonString = computed(() => {
  try {
    return JSON.stringify(props.data, null, 2)
  } catch {
    return '[Json] Unable to stringify data'
  }
})

const lastCopyResult = ref<'idle' | 'copied' | 'failed'>('idle')
const copyLabel = computed(() => {
  if (copying.value) return 'Copying…'
  if (lastCopyResult.value === 'copied') return 'Copied'
  if (lastCopyResult.value === 'failed') return 'Copy failed'
  return 'Copy JSON'
})

const { copyText, copying } = useDevClipboard()

const openPanel = () => {
  panelVisible.value = true
  expanded.value = true
}

const onCopy = async () => {
  const payload = `${props.title}\n${props.context}\n${jsonString.value}`
  const ok = await copyText(payload, {
    label: `${props.title} · ${props.context}`,
  })

  lastCopyResult.value = ok ? 'copied' : 'failed'
  window.setTimeout(() => {
    lastCopyResult.value = 'idle'
  }, 1200)
}
</script>

<style scoped>
.jsonpanel-launcher {
  display: flex;
  justify-content: flex-end;
}

.jsonpanel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.jsonpanel-title {
  margin: 0;
}

.jsonpanel-context {
  margin: 2px 0 0;
  font-size: 12px;
  color: rgba(107, 114, 128, 1);
}

.jsonpanel-meta {
  margin: 2px 0 0;
  font-size: 11px;
  color: rgba(107, 114, 128, 1);
}

.jsonpanel-actions {
  display: flex;
  gap: 8px;
}

.jsonpanel-object-preview {
  margin: 8px 0 12px;
  border: 1px solid rgba(107, 114, 128, 0.25);
  border-radius: 8px;
}

.jsonpanel-object-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 10px;
  padding: 6px 10px;
}

.jsonpanel-object-row + .jsonpanel-object-row {
  border-top: 1px solid rgba(107, 114, 128, 0.2);
}

.jsonpanel-object-key {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}

.jsonpanel-object-value {
  font-size: 12px;
  color: rgba(107, 114, 128, 1);
}

pre {
  margin-top: 8px;
}
</style>
