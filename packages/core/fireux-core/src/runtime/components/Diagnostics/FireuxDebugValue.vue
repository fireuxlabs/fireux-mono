<template>
  <span v-if="dependency || sensitive || debugState" class="debug-value__meta">
    <UBadge v-if="debugState" color="neutral" variant="soft" size="xs">
      {{ debugStateLabel }}
    </UBadge>
    <UBadge v-if="sensitive" color="warning" variant="soft" size="xs">
      Sensitive
    </UBadge>
    <small v-if="dependency">← {{ dependencyLabel }}</small>
  </span>

  <template v-if="!debugState">
    <span v-if="color" class="debug-value debug-value--color">
      <span
        class="debug-value__swatch"
        :style="{ backgroundColor: color }"
        aria-hidden="true"
      />
      <code>{{ color }}</code>
    </span>

    <UBadge
      v-else-if="typeof value === 'boolean'"
      :color="value ? 'success' : 'neutral'"
      variant="subtle"
      size="sm"
    >
      {{ value ? 'True' : 'False' }}
    </UBadge>

    <span v-else-if="isEmpty" class="debug-value debug-value--empty">
      {{ emptyLabel }}
    </span>

    <a
      v-else-if="imageUrl"
      class="debug-value debug-value--image"
      :href="imageUrl"
      target="_blank"
      rel="noreferrer"
    >
      <img :src="imageUrl" :alt="`${fieldLabel} preview`" loading="lazy" />
      <span>
        <strong>{{ fieldLabel }}</strong>
        <small>{{ urlLabel }}</small>
      </span>
      <UIcon name="i-lucide-external-link" aria-hidden="true" />
    </a>

    <a
      v-else-if="url"
      class="debug-value debug-value--url"
      :href="url"
      target="_blank"
      rel="noreferrer"
    >
      <span>{{ urlLabel }}</span>
      <UIcon name="i-lucide-external-link" aria-hidden="true" />
    </a>

    <details
      v-else-if="Array.isArray(value)"
      class="debug-value debug-value--structured"
      :open="expanded"
    >
      <summary>
        {{ value.length }} {{ value.length === 1 ? 'item' : 'items' }}
      </summary>
      <ol v-if="value.length" class="debug-value__list">
        <li v-for="(item, index) in value" :key="index">
          <FireuxDebugValue
            :name="name"
            :value="item"
            :path="`${path}[${index}]`"
            :depth="depth + 1"
          />
        </li>
      </ol>
    </details>

    <details
      v-else-if="record"
      class="debug-value debug-value--structured"
      :open="expanded"
    >
      <summary>
        {{ fields.length }} {{ fields.length === 1 ? 'field' : 'fields' }}
      </summary>
      <dl class="debug-value__fields">
        <div
          v-for="field in fields"
          :key="field.key"
          class="debug-value__field"
        >
          <dt>{{ field.label }}</dt>
          <dd>
            <FireuxDebugValue
              :name="field.key"
              :value="field.value"
              :path="path ? `${path}.${field.key}` : field.key"
              :depth="depth + 1"
              :expanded="depth < 1"
            />
          </dd>
        </div>
      </dl>
    </details>

    <code v-else class="debug-value debug-value--primitive">{{ value }}</code>
  </template>

  <span v-if="depth <= 1" class="debug-value__actions">
    <UButton size="xs" variant="ghost" icon="i-lucide-copy" @click="copyValue">
      Value
    </UButton>
    <UButton size="xs" variant="ghost" icon="i-lucide-copy" @click="copyPath">
      Path
    </UButton>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDiagnosticsClipboard } from '../../composables/diagnostics/useDiagnosticsClipboard'
import {
  humanizeDebugKey,
  isDebugColor,
  isDebugUrl,
} from '../../utils/diagnostics/format'

defineOptions({ name: 'FireDiagnosticsFireuxDebugValue' })

const props = withDefaults(
  defineProps<{
    name?: string
    value: unknown
    depth?: number
    expanded?: boolean
    path?: string
    dependency?: string | string[]
  }>(),
  {
    name: 'value',
    depth: 0,
    expanded: false,
    path: '',
  }
)

const color = computed(() => (isDebugColor(props.value) ? props.value : ''))
const url = computed(() => (isDebugUrl(props.value) ? props.value : ''))
const fieldLabel = computed(() => humanizeDebugKey(props.name))
const sensitive = computed(() =>
  /(?:^|[_-])(?:password|secret|token|email|phone|address|coordinates?|owner_id)(?:[_-]|$)/i.test(
    props.name
  )
)
const debugState = computed(() => {
  if (!record.value || Object.keys(record.value).length !== 1) return ''
  const state = record.value.__debugState
  return state === 'loading' || state === 'not-fetched' || state === 'redacted'
    ? state
    : ''
})
const debugStateLabel = computed(() =>
  debugState.value === 'not-fetched'
    ? 'Not fetched'
    : humanizeDebugKey(debugState.value)
)
const dependencyLabel = computed(() =>
  Array.isArray(props.dependency)
    ? props.dependency.join(' + ')
    : props.dependency
)
const imageUrl = computed(() => {
  if (!url.value) return ''
  return /(?:^|[_-])(?:images?|logos?|wordmarks?|avatars?|covers?|thumbnails?|photos?)(?:[_-]|$)/i.test(
    props.name
  )
    ? url.value
    : ''
})
const record = computed<Record<string, unknown> | undefined>(() =>
  props.value && !Array.isArray(props.value) && typeof props.value === 'object'
    ? (props.value as Record<string, unknown>)
    : undefined
)
const fields = computed(() =>
  Object.entries(record.value ?? {}).map(([key, value]) => ({
    key,
    label: humanizeDebugKey(key),
    value,
  }))
)
const isEmpty = computed(
  () => props.value === null || props.value === undefined || props.value === ''
)
const emptyLabel = computed(() => {
  if (props.value === null) return 'No data (null)'
  if (props.value === undefined) return 'Not fetched (undefined)'
  return 'Empty'
})
const { copyText } = useDiagnosticsClipboard()
const copyValue = async (): Promise<void> => {
  await copyText(
    typeof props.value === 'string'
      ? props.value
      : (JSON.stringify(props.value, null, 2) ?? String(props.value)),
    { label: props.path || props.name }
  )
}
const copyPath = async (): Promise<void> => {
  await copyText(props.path || props.name, { label: 'Field path' })
}
const urlLabel = computed(() => {
  if (!url.value) return ''
  try {
    const parsed = new URL(url.value)
    const leaf = decodeURIComponent(
      parsed.pathname.split('/').filter(Boolean).at(-1) ?? ''
    )
    return leaf || parsed.hostname
  } catch {
    return url.value
  }
})
</script>

<style scoped>
.debug-value {
  min-width: 0;
}

.debug-value__meta,
.debug-value__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing);
}

.debug-value__meta {
  margin-bottom: var(--spacing);
}
.debug-value__meta small {
  color: var(--ui-text-muted);
}
.debug-value__actions {
  margin-top: var(--spacing);
}

.debug-value--color,
.debug-value--url,
.debug-value--image {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 1.5);
}

.debug-value--image {
  width: min(100%, 360px);
  padding: calc(var(--spacing) * 1.5);
  border: 1px solid var(--ui-border-muted);
  border-radius: var(--ui-radius);
  background: var(--ui-bg);
  color: var(--ui-text-toned);
  text-decoration: none;
}

.debug-value--image img {
  width: auto;
  height: auto;
  max-width: calc(var(--spacing) * 24);
  max-height: calc(var(--spacing) * 24);
  flex: 0 0 auto;
  border-radius: var(--ui-radius);
  background: var(--ui-bg-muted);
  object-fit: contain;
}

.debug-value--image > span {
  display: grid;
  min-width: 0;
  flex: 1;
}

.debug-value--image strong,
.debug-value--image small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debug-value--image strong {
  color: var(--ui-text-highlighted);
  font-weight: var(--font-weight-medium);
}

.debug-value--image small {
  color: var(--ui-text-muted);
}

.debug-value__swatch {
  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);
  flex: 0 0 auto;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, white 20%, transparent);
}

.debug-value--empty {
  color: var(--ui-text-dimmed);
  font-style: italic;
}

.debug-value--url {
  max-width: 100%;
  color: var(--ui-text-toned);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.debug-value--url span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debug-value--structured > summary {
  width: fit-content;
  cursor: pointer;
  color: var(--ui-text-muted);
}

.debug-value__fields,
.debug-value__list {
  margin: calc(var(--spacing) * 2) 0 0;
}

.debug-value__fields {
  overflow: hidden;
  border: 1px solid var(--ui-border-muted);
  border-radius: var(--ui-radius);
  background: var(--ui-bg-muted);
}

.debug-value__field {
  display: grid;
  grid-template-columns: minmax(110px, 0.65fr) minmax(0, 1.35fr);
  gap: calc(var(--spacing) * 2.5);
  padding: calc(var(--spacing) * 2);
}

.debug-value__field + .debug-value__field {
  border-top: 1px solid var(--ui-border-muted);
}

.debug-value__field dt {
  color: var(--ui-text-muted);
}

.debug-value__field dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.debug-value__list {
  display: grid;
  gap: calc(var(--spacing) * 1.5);
  padding-left: calc(var(--spacing) * 5);
}

.debug-value--primitive {
  color: var(--ui-text-highlighted);
  overflow-wrap: anywhere;
}
</style>
