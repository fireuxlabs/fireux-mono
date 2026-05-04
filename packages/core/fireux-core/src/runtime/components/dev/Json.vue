<template>
  <div v-if="shouldRender" class="fireux-dev-json">
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
          <div class="jsonpanel-eyebrow">FireUX dev JSON</div>
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
import { useDevDebugData } from '../../composables/dev/useDevDebugData'

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
const {
  isEmpty,
  dataKindLabel,
  dataSizeLabel,
  objectPreviewEntries,
  showObjectPreview,
  jsonString,
} = useDevDebugData(computed(() => props.data), {
  stringifyErrorMessage: '[Json] Unable to stringify data',
})

const shouldRender = computed(() => !props.hideWhenEmpty || !isEmpty.value)
const lastCopyResult = ref<'idle' | 'copied' | 'failed'>('idle')
const { copyText, copying } = useDevClipboard()
const copyLabel = computed(() => {
  if (copying.value) return 'Copying...'
  if (lastCopyResult.value === 'copied') return 'Copied'
  if (lastCopyResult.value === 'failed') return 'Copy failed'
  return 'Copy JSON'
})

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

.jsonpanel-launcher :deep(button) {
  border: 1px solid var(--fx-debug-violet-border);
  background: var(--fx-debug-violet-bg);
  color: var(--fx-debug-violet-text);
}

.jsonpanel-panel {
  border: 1px solid var(--fx-debug-violet-border);
  border-radius: 12px;
  background:
    linear-gradient(135deg, var(--fx-debug-violet-bg), transparent 48%),
    var(--ui-bg);
  box-shadow: inset 3px 0 0 var(--fx-debug-violet-muted);
  padding: 12px;
}

.jsonpanel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.jsonpanel-eyebrow {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--fx-debug-violet-border);
  border-radius: 999px;
  background: var(--fx-debug-violet-bg-strong);
  padding: 1px 7px;
  color: var(--fx-debug-violet-text);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.jsonpanel-title {
  margin: 6px 0 0;
  color: var(--fx-debug-violet-text);
  font-size: 13px;
  font-weight: 700;
}

.jsonpanel-context {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--fx-debug-violet-muted);
}

.jsonpanel-meta {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--fx-debug-violet-muted);
}

.jsonpanel-actions {
  display: flex;
  gap: 8px;
}

.jsonpanel-object-preview {
  margin: 8px 0 12px;
  border: 1px solid var(--fx-debug-violet-border);
  border-radius: 8px;
  background: var(--fx-debug-violet-bg);
}

.jsonpanel-object-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 10px;
  padding: 6px 10px;
}

.jsonpanel-object-row + .jsonpanel-object-row {
  border-top: 1px solid var(--fx-debug-violet-border);
}

.jsonpanel-object-key {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}

.jsonpanel-object-value {
  font-size: 12px;
  color: var(--ui-text-muted);
}

pre {
  border: 1px solid var(--fx-debug-violet-border);
  border-radius: 8px;
  background: var(--fx-debug-violet-bg);
  padding: 10px;
  margin-top: 8px;
  color: var(--ui-text);
}
</style>
