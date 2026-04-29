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
