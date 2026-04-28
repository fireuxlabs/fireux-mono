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
    </template>

    <pre v-if="open" class="fireux-debug-panel__json">{{ jsonString }}</pre>
  </UCard>
</template>

<script setup lang="ts">
import { computed, isRef, ref, unref } from 'vue'

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

const normalizeForJson = (value: unknown, seen = new WeakSet<object>()): unknown => {
  const source = isRef(value) ? unref(value) : value

  if (source === null || source === undefined) return source
  if (typeof source === 'function') return undefined
  if (typeof source === 'bigint') return source.toString()
  if (
    typeof source === 'string' ||
    typeof source === 'number' ||
    typeof source === 'boolean'
  ) {
    return source
  }

  if (source instanceof Date) return source.toISOString()
  if (source instanceof Error) {
    return {
      name: source.name,
      message: source.message,
      stack: source.stack,
    }
  }

  if (Array.isArray(source)) {
    return source.map((entry) => normalizeForJson(entry, seen))
  }

  if (typeof source === 'object') {
    const objectSource = source as Record<string, unknown>
    if (seen.has(objectSource)) return '[Circular]'

    seen.add(objectSource)

    if (source instanceof Map) {
      return Array.from(source.entries()).map(([key, entry]) => ({
        key: normalizeForJson(key, seen),
        value: normalizeForJson(entry, seen),
      }))
    }

    if (source instanceof Set) {
      return Array.from(source.values()).map((entry) => normalizeForJson(entry, seen))
    }

    const normalized: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(objectSource)) {
      const nextValue = normalizeForJson(entry, seen)
      if (nextValue !== undefined) normalized[key] = nextValue
    }
    return normalized
  }

  return String(source)
}

const normalizedData = computed(() => normalizeForJson(props.data))
const dataKind = computed<'array' | 'object' | 'primitive' | 'empty'>(() => {
  const value = normalizedData.value
  if (value === null || value === undefined) return 'empty'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  return 'primitive'
})
const dataKindLabel = computed(() => {
  if (dataKind.value === 'array') return 'Collection'
  if (dataKind.value === 'object') return 'Object'
  if (dataKind.value === 'primitive') return 'Primitive'
  return 'Empty'
})
const dataSizeLabel = computed(() => {
  const value = normalizedData.value
  if (Array.isArray(value)) return `${value.length} items`
  if (value && typeof value === 'object') {
    return `${Object.keys(value as Record<string, unknown>).length} keys`
  }
  if (dataKind.value === 'primitive') return '1 value'
  return '0'
})
const scopeLabel = computed(() => `${props.scope} debug`)
const jsonString = computed(() => {
  try {
    return JSON.stringify(normalizedData.value, null, 2) ?? 'undefined'
  } catch {
    return '[FireuxDebugPanel] Unable to stringify data'
  }
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
