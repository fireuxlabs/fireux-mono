<template>
  <div v-if="shouldRender" class="fireux-dev-json">
    <div v-if="!panelVisible" class="jsonpanel-launcher">
      <UButton
        icon="i-heroicons-code-bracket-square"
        size="xs"
        variant="ghost"
        aria-label="Show debug panel"
        @click="openPanel"
      />
    </div>
    <div v-else class="jsonpanel-panel">
      <div class="jsonpanel-header">
        <div>
          <div class="jsonpanel-eyebrow">FireUX debug</div>
          <h2 class="jsonpanel-title">{{ title }}</h2>
          <p v-if="context" class="jsonpanel-context">{{ context }}</p>
          <p v-if="parent" class="jsonpanel-context">{{ parent }}</p>
          <p class="jsonpanel-meta">
            {{ routeLabel }} · {{ dataKindLabel }} · {{ dataSizeLabel }} ·
            {{ payloadBytes }} · {{ objectCount }} objects
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
            :icon="
              expanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
            "
            size="sm"
            variant="ghost"
            @click="expanded = !expanded"
          >
            {{ expanded ? 'Hide' : 'Show' }} debug
          </UButton>
          <UButton
            v-if="launcher"
            icon="i-heroicons-x-mark"
            size="sm"
            variant="ghost"
            @click="panelVisible = false"
          />
        </div>
      </div>
      <div v-if="expanded" class="jsonpanel-content">
        <div class="jsonpanel-view-switch" aria-label="Debug view">
          <UInput
            v-model="search"
            size="xs"
            icon="i-lucide-search"
            placeholder="Filter fields"
            aria-label="Filter debug fields"
          />
          <UButton
            size="xs"
            color="neutral"
            :variant="view === 'inspect' ? 'soft' : 'ghost'"
            icon="i-lucide-layout-list"
            @click="view = 'inspect'"
          >
            Inspect
          </UButton>
          <UButton
            size="xs"
            color="neutral"
            :variant="view === 'json' ? 'soft' : 'ghost'"
            icon="i-lucide-braces"
            @click="view = 'json'"
          >
            JSON
          </UButton>
        </div>

        <div v-if="view === 'inspect'" class="jsonpanel-sections">
          <FireDiagnosticsFireuxDebugDrift
            :findings="contractFindings"
            :missing-count="missingCount"
            :extra-count="extraCount"
            :deprecated-count="deprecatedCount"
            :contract-names="contractNames"
            :has-contracts="hasContracts"
          />
          <section
            v-for="section in sections"
            :key="section.key"
            class="jsonpanel-section"
          >
            <header class="jsonpanel-section__header">
              <strong>{{ section.label }}</strong>
              <span>{{ section.meta }}</span>
            </header>
            <dl class="jsonpanel-section__rows">
              <div
                v-for="entry in section.entries"
                :key="entry.key"
                class="jsonpanel-section__row"
              >
                <dt>
                  {{ entry.label }}
                  <UBadge
                    v-for="issue in issuesFor(section.key, entry.key)"
                    :key="issue"
                    :color="issue === 'unexpected' ? 'warning' : 'error'"
                    variant="soft"
                    size="xs"
                    >{{ issue }}</UBadge
                  >
                </dt>
                <dd>
                  <FireDiagnosticsFireuxDebugValue
                    :name="entry.key"
                    :value="entry.value"
                    :path="`${section.key}.${entry.key}`"
                    :dependency="dependencyFor(section.key, entry.key)"
                    :expanded="section.key === 'objects'"
                  />
                </dd>
              </div>
            </dl>
          </section>
        </div>
        <pre v-else>{{ jsonString }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed, ref, watch } from 'vue'
import { useDiagnosticsClipboard } from '../../composables/diagnostics/useDiagnosticsClipboard'
import { useDiagnosticsDebugData } from '../../composables/diagnostics/useDiagnosticsDebugData'
import { useDiagnosticsDebugContracts } from '../../composables/diagnostics/useDiagnosticsDebugContracts'
import { useDiagnosticsDebugSections } from '../../composables/diagnostics/useDiagnosticsDebugSections'
import type {
  DevDebugContract,
  DevDebugContracts,
  DevDebugDependencies,
  DevDebugPayload,
} from '../../types/dev-debug'

defineOptions({ name: 'FireDiagnosticsDebugPanel' })

interface DebugPanelProps {
  objects: DevDebugPayload['objects'] | unknown
  derived: DevDebugPayload['derived'] | unknown
  objectOrigin?: DevDebugPayload['objectOrigin']
  contract?: DevDebugContract
  contracts?: DevDebugContracts
  derivedDependencies?: DevDebugDependencies
  context?: string
  title?: string
  parent?: string
  open?: boolean
  defaultOpen?: boolean
  hideWhenEmpty?: boolean
  includeRoute?: boolean
  launcher?: boolean
  scope?: string
}

const props = withDefaults(defineProps<DebugPanelProps>(), {
  title: 'Debug',
  objectOrigin: 'passed',
  context: '',
  parent: '',
  open: undefined,
  defaultOpen: false,
  hideWhenEmpty: true,
  includeRoute: true,
  launcher: true,
  scope: 'runtime',
})
const emit = defineEmits<{
  opened: []
  closed: []
}>()

const route = useRoute()
const routeDebug = computed(() => ({
  path: route.path,
  name: route.name ? String(route.name) : '',
  params: route.params,
  query: route.query,
}))
const routeLabel = computed(() =>
  props.includeRoute
    ? route.path || 'route unavailable'
    : `${props.scope} debug`
)
const startsOpen = computed(() => props.open ?? props.defaultOpen)
const structuredData = computed(() => {
  const derived =
    props.derived &&
    !Array.isArray(props.derived) &&
    typeof props.derived === 'object'
      ? (props.derived as Record<string, unknown>)
      : { value: props.derived }

  return {
    objects: props.objects,
    derived: {
      ...(props.includeRoute ? { route: routeDebug.value } : {}),
      ...(props.parent ? { parent: props.parent } : {}),
      ...derived,
    },
  }
})
const expanded = ref(startsOpen.value)
const view = ref<'inspect' | 'json'>('inspect')
const search = ref('')
const panelVisible = ref(props.launcher ? startsOpen.value : true)
watch(
  panelVisible,
  (visible: boolean) => {
    if (visible) {
      emit('opened')
    } else {
      emit('closed')
    }
  },
  { immediate: true }
)
const { isEmpty, normalizedData, dataKindLabel, dataSizeLabel, jsonString } =
  useDiagnosticsDebugData(structuredData, {
    stringifyErrorMessage: '[DebugPanel] Unable to stringify data',
  })
const rawSections = useDiagnosticsDebugSections(normalizedData)
const {
  findings: contractFindings,
  missingCount,
  extraCount,
  deprecatedCount,
  contractNames,
  hasContracts,
} = useDiagnosticsDebugContracts(
  () => props.objects,
  () => props.contract,
  () => props.contracts
)
const sections = computed(() => {
  const query = search.value.trim().toLowerCase()
  return rawSections.value.map((section) => {
    const normalized =
      section.key === 'objects'
        ? {
            ...section,
            label:
              props.objectOrigin === 'passed'
                ? 'Passed objects'
                : 'Fetched objects',
          }
        : section.key === 'derived'
          ? { ...section, label: 'Derived variables' }
          : section
    return query
      ? {
          ...normalized,
          entries: normalized.entries.filter((entry) =>
            `${entry.label} ${JSON.stringify(entry.value)}`
              .toLowerCase()
              .includes(query)
          ),
        }
      : normalized
  })
})

const payloadBytes = computed(() => {
  const bytes = new TextEncoder().encode(jsonString.value).length
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
})
const objectCount = computed(() => {
  const value = props.objects
  if (Array.isArray(value)) return value.length
  return value && typeof value === 'object' ? Object.keys(value).length : 0
})
const cleanDriftPath = (value: string) => value.split(' (')[0]
const issuesFor = (section: string, key: string) => {
  if (section !== 'objects') return []
  const issues = new Set<string>()
  for (const finding of contractFindings.value) {
    if (finding.missing.some((path) => cleanDriftPath(path) === key))
      issues.add('missing')
    if (finding.extra.some((path) => cleanDriftPath(path) === key))
      issues.add('unexpected')
    if (finding.deprecated.some((path) => cleanDriftPath(path) === key))
      issues.add('deprecated')
  }
  return [...issues]
}
const dependencyFor = (section: string, key: string) =>
  section === 'derived' ? props.derivedDependencies?.[key] : undefined

const isDev = import.meta.dev
const shouldRender = computed(
  () => isDev && (!props.hideWhenEmpty || !isEmpty.value)
)
const lastCopyResult = ref<'idle' | 'copied' | 'failed'>('idle')
const { copyText, copying } = useDiagnosticsClipboard()
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
  padding: calc(var(--spacing) * 3);
}
.jsonpanel-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
  margin-bottom: calc(var(--spacing) * 2);
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
  margin: calc(var(--spacing) * 1.5) 0 0;
  color: var(--fx-debug-ink);
  font-size: 13px;
  font-weight: var(--font-weight-bold);
}
.jsonpanel-context,
.jsonpanel-meta {
  margin: calc(var(--spacing) * 0.5) 0 0;
  color: var(--fx-debug-yellow-muted);
}
.jsonpanel-context {
  font-size: var(--text-xs);
}
.jsonpanel-meta {
  font-size: 11px;
}
.jsonpanel-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
.jsonpanel-content {
  display: grid;
  gap: calc(var(--spacing) * 2);
}
.jsonpanel-view-switch {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing);
}
.jsonpanel-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: calc(var(--spacing) * 2.5);
}
.jsonpanel-section {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--fx-debug-yellow-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg);
}
.jsonpanel-section__header {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  border-bottom: 1px solid var(--fx-debug-yellow-border);
  background: var(--fx-debug-yellow-bg);
  padding: calc(var(--spacing) * 2);
  color: var(--fx-debug-ink);
}
.jsonpanel-section__header span {
  color: var(--fx-debug-yellow-muted);
}
.jsonpanel-section__rows {
  margin: 0;
}
.jsonpanel-section__row {
  display: grid;
  grid-template-columns: minmax(100px, 0.7fr) minmax(0, 1.3fr);
  gap: calc(var(--spacing) * 2.5);
  padding: calc(var(--spacing) * 2);
}
.jsonpanel-section__row + .jsonpanel-section__row {
  border-top: 1px solid var(--ui-border-muted);
}
.jsonpanel-section__row dt {
  color: var(--ui-text-muted);
}
.jsonpanel-section__row dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}
pre {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--fx-debug-yellow-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--fx-debug-yellow-bg);
  padding: calc(var(--spacing) * 2.5);
  margin-top: calc(var(--spacing) * 2);
  color: var(--ui-text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
