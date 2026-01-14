<template>
  <UPageCTA
    title="Current app"
    description="The app currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <div class="space-y-3">
        <div v-if="app" class="flex justify-end">
          <UButton size="xs" variant="ghost" @click="toggleView">
            {{ view === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </div>

        <OrganismsAppCardsPreview
          v-if="app && view === 'preview'"
          v-bind="card(app)"
        />

        <OrganismsAppCardsProfile
          v-else-if="app"
          v-bind="card(app)"
          :app="app"
        />
        <OrganismsAppCreateSystem v-else />

        <div
          v-if="showDebug"
          class="pt-4 mt-4 border-t border-slate-200/70 max-w-3xl mx-auto space-y-2"
        >
          <component
            :is="DevJson"
            v-if="DevJson"
            title="Dev · App"
            :data="debugPayload"
          />
        </div>

        <div class="flex justify-end">
          <UButton variant="ghost" size="sm" to="/apps/learn-more">Learn more</UButton>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'
import { App as AppModel } from '../../../models/core/app.model'
import type { App as AppType } from '../../../models/core/app.model'

const props = defineProps<{
  /** Optional model to diff against the resolved app (dev-only visibility). */
  compareTo?: Partial<App> | null
}>()

const { app, card } = useApp()

const DevJson = defineAsyncComponent(() =>
  import('../../dev/DevJson.vue')
)

type View = 'preview' | 'profile'
const view = ref<View>('preview')
const toggleView = () => {
  view.value = view.value === 'preview' ? 'profile' : 'preview'
}

watch(
  () => Boolean(app.value),
  (hasApp) => {
    if (!hasApp) view.value = 'preview'
  }
)

const showDebug = import.meta.dev

const kindOf = (v: unknown): string => {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (!v || typeof v !== 'object') return false
  if (Array.isArray(v)) return false
  return Object.prototype.toString.call(v) === '[object Object]'
}

const driftCompare = (
  template: unknown,
  data: unknown,
  path = ''
): { kind: 'missing' | 'extra' | 'type'; path: string; expectedType?: string; actualType?: string }[] => {
  const issues: { kind: 'missing' | 'extra' | 'type'; path: string; expectedType?: string; actualType?: string }[] = []

  const tType = kindOf(template)
  const dType = kindOf(data)

  if (!isPlainObject(template)) {
    if (tType !== dType) {
      issues.push({ kind: 'type', path: path || '(root)', expectedType: tType, actualType: dType })
    }
    return issues
  }

  if (!isPlainObject(data)) {
    issues.push({ kind: 'type', path: path || '(root)', expectedType: 'object', actualType: dType })
    return issues
  }

  const tKeys = Object.keys(template)
  const dKeys = Object.keys(data)

  for (const key of tKeys) {
    if (!(key in data)) {
      issues.push({
        kind: 'missing',
        path: path ? `${path}.${key}` : key,
        expectedType: kindOf((template as Record<string, unknown>)[key]),
      })
    }
  }

  for (const key of dKeys) {
    if (!(key in template)) {
      issues.push({
        kind: 'extra',
        path: path ? `${path}.${key}` : key,
        actualType: kindOf((data as Record<string, unknown>)[key]),
      })
    }
  }

  for (const key of tKeys) {
    if (!(key in data)) continue
    const tVal = (template as Record<string, unknown>)[key]
    const dVal = (data as Record<string, unknown>)[key]

    const tt = kindOf(tVal)
    const dt = kindOf(dVal)

    if (isPlainObject(tVal) || isPlainObject(dVal)) {
      issues.push(...driftCompare(tVal, dVal, path ? `${path}.${key}` : key))
      continue
    }

    if (tt !== dt) {
      issues.push({
        kind: 'type',
        path: path ? `${path}.${key}` : key,
        expectedType: tt,
        actualType: dt,
      })
    }
  }

  return issues
}

const templateDrift = computed(() => {
  if (!showDebug) return []
  const current = app.value as AppType | null | undefined
  if (!current) return []
  return driftCompare(AppModel, current)
})

const compareToDrift = computed(() => {
  if (!showDebug) return []
  const current = app.value as AppType | null | undefined
  const target = props.compareTo
  if (!current || !target) return []
  return driftCompare(target, current)
})

const health = computed(() => {
  if (!app.value) return { status: 'missing', templateDrift: [], compareToDrift: [] }
  if (templateDrift.value.length) return { status: 'drift', templateDrift: templateDrift.value, compareToDrift: compareToDrift.value }
  if (compareToDrift.value.length) return { status: 'diff', templateDrift: [], compareToDrift: compareToDrift.value }
  return { status: 'pass', templateDrift: [], compareToDrift: [] }
})

const debugPayload = computed(() => {
  return {
    view: view.value,
    app: app.value ?? null,
    card: app.value ? card(app.value) : null,
    compareTo: props.compareTo ?? null,
    health: health.value,
    templateDrift: templateDrift.value,
    compareToDrift: compareToDrift.value,
  }
})
</script>
