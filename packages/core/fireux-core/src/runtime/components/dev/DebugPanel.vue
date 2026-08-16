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
          <DevFireuxDebugDrift
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
                  <DevFireuxDebugValue
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
import { useDevClipboard } from '../../composables/dev/useDevClipboard'
import { useDevDebugData } from '../../composables/dev/useDevDebugData'
import { useDevDebugContracts } from '../../composables/dev/useDevDebugContracts'
import { useDevDebugSections } from '../../composables/dev/useDevDebugSections'
import type {
  DevDebugContract,
  DevDebugContracts,
  DevDebugDependencies,
  DevDebugPayload,
} from '../../types/dev-debug'

defineOptions({ name: 'DebugPanel' })

interface DebugPanelProps {
  objects: DevDebugPayload['objects'] | unknown
  derived: DevDebugPayload['derived'] | unknown
  objectOrigin: DevDebugPayload['objectOrigin']
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
  context: '',
  parent: '',
  open: undefined,
  defaultOpen: false,
  hideWhenEmpty: true,
  includeRoute: false,
  launcher: false,
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
  useDevDebugData(structuredData, {
    stringifyErrorMessage: '[DebugPanel] Unable to stringify data',
  })
const rawSections = useDevDebugSections(normalizedData)
const {
  findings: contractFindings,
  missingCount,
  extraCount,
  deprecatedCount,
  contractNames,
  hasContracts,
} = useDevDebugContracts(
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

<style scoped src="./debug-panel.css"></style>
