<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>{{ title }}</div>
        <div class="flex items-center gap-2">
          <UButton
            size="xs"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-lucide-braces'"
            @click="copyShape"
          >
            {{ copying ? 'Copying…' : 'Copy shape' }}
          </UButton>
        </div>
      </div>
    </template>

    <UTree :nested="true" color="primary" :items="items" />
  </UCard>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useDiagnosticsClipboard } from '../../composables/diagnostics/useDiagnosticsClipboard'

defineOptions({ name: 'FireDiagnosticsModel' })

type ShapeNode = {
  key: string
  type: string
  children?: ShapeNode[]
}

const props = withDefaults(
  defineProps<{
    model?: Record<string, unknown>
    title?: string
  }>(),
  {
    title: 'Model shape',
    model: () => ({}),
  }
)

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return false
  return Object.prototype.toString.call(value) === '[object Object]'
}

const toType = (key: string, value: unknown): string => {
  if (isPlainObject(value) && Object.keys(value).length === 0 && /(^|_)at$|_at$|^created_at$|^updated_at$/i.test(key)) {
    return 'FirebaseTimestamp'
  }
  if (Array.isArray(value)) return 'array'
  if (value === null) return 'null'
  if (typeof value === 'string') {
    return value.startsWith('enum:') ? value : 'string'
  }
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (isPlainObject(value)) return 'object'
  return typeof value
}

const buildNodes = (model?: Record<string, unknown>): ShapeNode[] =>
  Object.keys(model ?? {}).map((key) => {
    const value = (model ?? {})[key]
    const type = toType(key, value)
    const children = isPlainObject(value) && Object.keys(value).length
      ? buildNodes(value)
      : undefined
    return { key, type, children }
  })

const nodes = computed(() => buildNodes(props.model))

const toTreeItems = (list: ShapeNode[], prefix = ''): any[] =>
  list.map((node) => {
    const path = prefix ? `${prefix}.${node.key}` : node.key
    const hasChildren = Boolean(node.children?.length)
    return {
      id: path,
      label: `${node.key}: ${typeLabel(node.type)}`,
      icon: hasChildren ? 'i-lucide-braces' : undefined,
      children: hasChildren ? toTreeItems(node.children ?? [], path) : undefined,
    }
  })

const items = computed(() => toTreeItems(nodes.value))

const expandAllSignal = ref(0)
const expandAllFlag = ref(true)

provide('devModel_expandAllFlag', expandAllFlag)
provide('devModel_expandAllSignal', expandAllSignal)

const { copyJSON, copying } = useDiagnosticsClipboard()

const copyShape = async () => {
  const payload = items.value
  await copyJSON(payload, { label: `${props.title} (tree)` })
}

const typeLabel = (value: string) =>
  value.startsWith('enum:')
    ? `enum (${value.slice('enum:'.length).split('|').join(' | ')})`
    : value === 'FirebaseTimestamp'
    ? 'FirebaseTimestamp'
    : value

</script>

<style scoped>
</style>
