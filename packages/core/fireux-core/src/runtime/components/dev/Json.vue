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
          <p v-if="parent" class="jsonpanel-context">{{ parent }}</p>
          <p class="jsonpanel-meta">
            {{ routeLabel }} · {{ dataKindLabel }} · {{ dataSizeLabel }}
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
import { useRoute } from '#imports'
import { computed, ref } from 'vue'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'
import { useDevDebugData } from '../../composables/dev/useDevDebugData'

defineOptions({ name: 'Json' })

// TODO: Enforce strong, descriptive context strings for all DevJson usages.
interface JsonPanelProps {
  data?: unknown
  objects?: unknown
  derived?: unknown
  context: string
  title?: string
  parent?: string
  open?: boolean
  defaultOpen?: boolean
  hideWhenEmpty?: boolean
}

const props = withDefaults(defineProps<JsonPanelProps>(), {
  title: 'JSON',
  parent: '',
  open: undefined,
  defaultOpen: false,
  hideWhenEmpty: true,
})

const route = useRoute()
const routeDebug = computed(() => ({
  path: route.path,
  name: route.name ? String(route.name) : '',
  params: route.params,
  query: route.query,
}))
const routeLabel = computed(() => route.path || 'route unavailable')
const startsOpen = computed(() => props.open ?? props.defaultOpen)
const structuredData = computed(() => {
  const hasStructuredData =
    props.objects !== undefined ||
    props.derived !== undefined

  if (!hasStructuredData) return props.data

  return {
    route: routeDebug.value,
    parent: props.parent || undefined,
    objects: props.objects,
    derived: props.derived,
  }
})
const expanded = ref(startsOpen.value)
const panelVisible = ref(startsOpen.value)
const {
  isEmpty,
  dataKindLabel,
  dataSizeLabel,
  objectPreviewEntries,
  showObjectPreview,
  jsonString,
} = useDevDebugData(structuredData, {
  stringifyErrorMessage: '[Json] Unable to stringify data',
})

const isDev = import.meta.dev
const shouldRender = computed(() => isDev && (!props.hideWhenEmpty || !isEmpty.value))
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
.fireux-dev-json {
  min-width: 0;
  max-width: 100%;
}

.jsonpanel-launcher {
  display: flex;
  justify-content: flex-end;
}

.jsonpanel-launcher :deep(button) {
  border: 1px solid var(--fx-debug-yellow-border);
  background: var(--fx-debug-yellow-bg);
  color: var(--fx-debug-ink);
}

.jsonpanel-panel {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--fx-debug-yellow-border);
  border-radius: calc(var(--ui-radius) * 3);
  background:
    linear-gradient(135deg, var(--fx-debug-yellow-bg), transparent 48%),
    var(--ui-bg);
  padding: 12px;
}

.jsonpanel-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
  margin-bottom: 8px;
}

.jsonpanel-header > :first-child {
  min-width: 0;
}

.jsonpanel-eyebrow {
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

.jsonpanel-title {
  margin: 6px 0 0;
  color: var(--fx-debug-ink);
  font-size: 13px;
  font-weight: var(--font-weight-bold);
}

.jsonpanel-context {
  margin: 2px 0 0;
  font-size: var(--text-xs);
  color: var(--fx-debug-yellow-muted);
}

.jsonpanel-meta {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--fx-debug-yellow-muted);
}

.jsonpanel-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 8px;
}

.jsonpanel-object-preview {
  margin: 8px 0 12px;
  border: 1px solid var(--fx-debug-yellow-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--fx-debug-yellow-bg);
}

.jsonpanel-object-row {
  display: grid;
  grid-template-columns: minmax(0, 200px) minmax(0, 1fr);
  gap: 10px;
  padding: 6px 10px;
}

.jsonpanel-object-row + .jsonpanel-object-row {
  border-top: 1px solid var(--fx-debug-yellow-border);
}

.jsonpanel-object-key {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.jsonpanel-object-value {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
}

pre {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--fx-debug-yellow-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--fx-debug-yellow-bg);
  padding: 10px;
  margin-top: 8px;
  color: var(--ui-text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .jsonpanel-object-row {
    grid-template-columns: 1fr;
    gap: calc(var(--spacing) * 0.5);
  }
}
</style>
