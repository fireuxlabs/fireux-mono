<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>{{ title }}</div>
        <UButton
          size="xs"
          :disabled="copying"
          :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
          @click="copyShape"
        >
          {{ copying ? 'Copying…' : 'Copy shape' }}
        </UButton>
      </div>
    </template>

    <pre class="font-sans leading-tight">{{ '{' }}
  <span v-for="(line, index) in codeLines" :key="index" class="block dev-model-line">
  <span>{{ line.indent }}</span><span>{{ line.key }}</span><span>:</span> <span class="text-gray-500">{{ line.type }}</span>
</span>
{{ '{' }}
    </pre>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'

defineOptions({ name: 'DevModel' })

type ShapeNode = {
  key: string
  type: string
  children?: ShapeNode[]
}


const props = withDefaults(
  defineProps<{
    model: Record<string, unknown>
    title?: string
  }>(),
  {
    title: 'Model shape',
  }
)

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return false
  return Object.prototype.toString.call(value) === '[object Object]'
}

const toType = (value: unknown): string => {
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

const buildNodes = (model: Record<string, unknown>): ShapeNode[] =>
  Object.keys(model).map((key) => {
    const value = model[key]
    const type = toType(value)
    const children = isPlainObject(value) && Object.keys(value).length
      ? buildNodes(value)
      : undefined
    return { key, type, children }
  })

const nodes = computed(() => buildNodes(props.model))
const rows = computed(() => flattenNodes(nodes.value))

const { copyJSON, copying } = useDevClipboard()

const copyShape = async () => {
  await copyJSON(nodes.value, { label: props.title })
}

const typeLabel = (value: string) =>
  value.startsWith('enum:')
    ? `enum (${value.slice('enum:'.length).split('|').join(' | ')})`
    : value

const flattenNodes = (list: ShapeNode[], prefix = ''): { path: string; type: string }[] => {
  const rows: { path: string; type: string }[] = []
  for (const node of list) {
    const path = prefix ? `${prefix}.${node.key}` : node.key
    rows.push({ path, type: node.type })
    if (node.children?.length) rows.push(...flattenNodes(node.children, path))
  }
  return rows
}

const codeLines = computed(() =>
  rows.value.map((row) => {
    const lastDot = row.path.lastIndexOf('.')
    const key = lastDot >= 0 ? row.path.slice(lastDot + 1) : row.path
    const indentLevel = row.path.split('.').length - 1
    return {
      indent: '  '.repeat(indentLevel),
      key,
      type: typeLabel(row.type),
    }
  })
)

</script>

<style scoped>
.dev-model-line {
  line-height: 1.1;
}
</style>
