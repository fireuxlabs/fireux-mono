import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  computed,
  ref,
  reactive,
  watch,
  isRef,
  unref,
  shallowRef,
  watchEffect,
  effectScope,
} from 'vue'
import { useCollectionPage } from '../runtime/composables/shared/useCollectionPage.ts'
import {
  humanizeDebugKey,
  isDebugColor,
} from '../runtime/utils/diagnostics/format.ts'

function load(file, result, dependencies, dev = true) {
  let source = readFileSync(new URL(file, import.meta.url), 'utf8')
  if (file.endsWith('.vue'))
    source = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', String(dev))
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const useDiagnosticsDebugData = load(
  '../runtime/composables/diagnostics/useDiagnosticsDebugData.ts',
  'useDiagnosticsDebugData',
  { computed, isRef, unref, shallowRef, watchEffect }
)
const useDiagnosticsDebugSections = load(
  '../runtime/composables/diagnostics/useDiagnosticsDebugSections.ts',
  'useDiagnosticsDebugSections',
  { computed, humanizeDebugKey, isDebugColor }
)
function panel(supplied, { dev = true } = {}) {
  const scope = effectScope()
  const route = reactive({ path: '/apps', name: 'Apps', params: {}, query: {} })
  const state = scope.run(() =>
    load(
      '../runtime/components/Diagnostics/DebugPanel.vue',
      '({ props, sections, structuredData, panelVisible, expanded, shouldRender, openPanel })',
      {
        computed,
        ref,
        watch,
        defineOptions() {},
        defineProps: () => supplied,
        withDefaults: (props, defaults) =>
          new Proxy(props, {
            get: (target, key) =>
              target[key] === undefined ? defaults[key] : target[key],
          }),
        defineEmits: () => () => {},
        useRoute: () => route,
        useDiagnosticsDebugData,
        useDiagnosticsDebugSections,
        useDiagnosticsClipboard: () => ({
          copying: ref(false),
          copyText: async () => true,
        }),
        useDiagnosticsDebugContracts: () =>
          Object.fromEntries(
            Object.entries({
              findings: [],
              missingCount: 0,
              extraCount: 0,
              deprecatedCount: 0,
              contractNames: [],
              hasContracts: false,
            }).map(([key, value]) => [key, ref(value)])
          ),
      },
      dev
    )
  )
  return { ...state, route, stop: () => scope.stop() }
}

test('collection diagnostics contain only facts and stay live through panel defaults', () => {
  const rows = ref([{ id: 'a' }])
  const page = useCollectionPage({
    entity: 'apps',
    title: 'Showcase',
    collection: { records: rows, outcome: 'ready' },
    diagnostics: { derived: () => ({ scope: 'platform' }) },
  })
  assert.deepEqual(Object.keys(page.diagnostics).sort(), ['derived', 'objects'])
  const h = panel(
    reactive({
      get objects() {
        return page.diagnostics.objects
      },
      get derived() {
        return page.diagnostics.derived
      },
    })
  )
  try {
    assert.equal(h.props.title, 'Debug')
    assert.equal(h.props.context, '')
    assert.equal(h.props.objectOrigin, 'passed')
    assert.equal(h.props.launcher, true)
    assert.equal(h.props.includeRoute, true)
    assert.equal(h.panelVisible.value, false)
    assert.equal(
      h.sections.value.find((section) => section.key === 'objects').label,
      'Passed objects'
    )
    assert.equal(h.structuredData.value.derived.route.path, '/apps')
    rows.value = [{ id: 'b' }, { id: 'c' }]
    h.route.path = '/apps?view=all'
    assert.equal(h.structuredData.value.derived.count, 2)
    assert.equal(h.structuredData.value.derived.scope, 'platform')
    assert.equal(h.structuredData.value.objects.apps, rows.value)
    assert.equal(h.structuredData.value.derived.route.path, '/apps?view=all')
    h.openPanel()
    assert.equal(h.panelVisible.value, true)
    assert.equal(h.expanded.value, true)
  } finally {
    h.stop()
  }
})
test('acquisition owners and inline callers can explicitly override diagnostics display', () => {
  const h = panel({
    objects: { apps: [] },
    derived: {},
    objectOrigin: 'fetched',
    title: 'Reader',
    context: 'Acquired here',
    launcher: false,
    includeRoute: false,
  })
  try {
    assert.equal(h.props.title, 'Reader')
    assert.equal(h.props.context, 'Acquired here')
    assert.equal(
      h.sections.value.find((section) => section.key === 'objects').label,
      'Fetched objects'
    )
    assert.equal(h.panelVisible.value, true)
    assert.equal('route' in h.structuredData.value.derived, false)
  } finally {
    h.stop()
  }
})
test('panel-owned defaults never enable production rendering', () => {
  const h = panel(
    { objects: { apps: [{ id: 'a' }] }, derived: {}, defaultOpen: true },
    { dev: false }
  )
  try {
    assert.equal(h.shouldRender.value, false)
  } finally {
    h.stop()
  }
})
