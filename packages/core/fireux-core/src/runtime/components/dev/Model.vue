<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>{{ title }}</div>
        <div class="flex items-center gap-2">
          <UButton
            size="xs"
            variant="ghost"
            :icon="viewMode === 'flat' ? 'i-heroicons-list-bullet' : 'i-heroicons-squares-2x2'"
            @click="viewMode = viewMode === 'flat' ? 'tree' : 'flat'"
            :title="viewMode === 'flat' ? 'Switch to tree view' : 'Switch to flat view'"
          />
          <UButton
            size="xs"
            :disabled="copying"
            :icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
            @click="copyShape"
          >
            {{ copying ? 'Copying…' : 'Copy shape' }}
          </UButton>
        </div>
      </div>
    </template>

    <div v-if="viewMode === 'flat'">
      <pre class="font-sans leading-tight">{{ '{' }}
  <span v-for="(line, index) in codeLines" :key="index" class="block dev-model-line">
  <span>{{ line.indent }}</span><span>{{ line.key }}</span><span>:</span> <span class="text-gray-500">{{ line.type }}</span>
</span>
{{ '{' }}
      </pre>
    </div>

    <div v-else>
      <UNTree v-if="uiTreeAvailable" :items="treeItems" />
      <div v-else>
        <ul class="space-y-2">
          <ShapeRow v-for="node in nodes" :key="node.key" :node="node" />
        </ul>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, defineComponent, getCurrentInstance, provide, ref, watch } from 'vue'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'

defineOptions({ name: 'Model' })

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

const buildNodes = (model: Record<string, unknown>): ShapeNode[] =>
  Object.keys(model).map((key) => {
    const value = model[key]
    const type = toType(key, value)
    const children = isPlainObject(value) && Object.keys(value).length
      ? buildNodes(value)
      : undefined
    return { key, type, children }
  })

const nodes = computed(() => buildNodes(props.model))
const rows = computed(() => flattenNodes(nodes.value))
const viewMode = ref<'flat' | 'tree'>('flat')

const instance = getCurrentInstance()
const uiTreeAvailable = computed(() => Boolean(instance?.appContext?.components?.UNTree))

const toTreeItems = (list: ShapeNode[], prefix = ''): any[] =>
  list.map((node) => {
    const path = prefix ? `${prefix}.${node.key}` : node.key
    return {
      id: path,
      label: `${node.key}: ${typeLabel(node.type)}`,
      children: node.children ? toTreeItems(node.children, path) : undefined,
    }
  })

const treeItems = computed(() => toTreeItems(nodes.value))

const expandAllSignal = ref(0)
const expandAllFlag = ref(true)
const expandAll = () => {
  expandAllFlag.value = true
  expandAllSignal.value++
}
const collapseAll = () => {
  expandAllFlag.value = false
  expandAllSignal.value++
}

provide('devModel_expandAllFlag', expandAllFlag)
provide('devModel_expandAllSignal', expandAllSignal)

const { copyJSON, copying } = useDevClipboard()

const copyShape = async () => {
  const payload = viewMode.value === 'tree' && uiTreeAvailable.value ? treeItems.value : nodes.value
  await copyJSON(payload, { label: `${props.title} (${viewMode.value})` })
}

const ShapeRow = defineComponent({
  name: 'ModelInternalShapeRow',
  props: {
    node: { type: Object as () => ShapeNode, required: true },
  },
  setup() {
    const collapsed = ref(false)
    const toggle = () => (collapsed.value = !collapsed.value)

    const expandAllFlagInjected = expandAllFlag
    const expandAllSignalInjected = expandAllSignal
    watch(expandAllSignalInjected, () => {
      collapsed.value = !expandAllFlagInjected.value
    })

    const typeLabelLocal = (value: string) =>
      value.startsWith('enum:') ? `enum (${value.slice('enum:'.length).split('|').join(' | ')})` : value

    const typeClass = (value: string) => {
      if (value.startsWith('enum:')) return 'bg-emerald-100 text-emerald-800'
      switch (value) {
        case 'string':
          return 'bg-sky-100 text-sky-800'
        case 'number':
          return 'bg-violet-100 text-violet-800'
        case 'boolean':
          return 'bg-amber-100 text-amber-800'
        case 'array':
          return 'bg-teal-100 text-teal-800'
        case 'object':
          return 'bg-slate-100 text-slate-800'
        case 'null':
          return 'bg-rose-100 text-rose-800'
        default:
          return 'bg-slate-100 text-slate-800'
      }
    }

    return { collapsed, toggle, typeLabelLocal, typeClass }
  },
  template: `
    <li>
      <div class="flex items-center gap-2">
        <button v-if="node.children?.length" @click="toggle" class="text-xs text-gray-500">{{ collapsed ? '▸' : '▾' }}</button>
        <span v-else class="w-4" />
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ node.key }}</span>
        <span class="text-gray-400">:</span>
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="typeClass(node.type)">
          {{ typeLabelLocal(node.type) }}
        </span>
      </div>
      <ul v-if="node.children?.length && !collapsed" class="mt-1 ml-4 border-l border-gray-200 pl-3 space-y-1">
        <ShapeRow v-for="child in node.children" :key="child.key" :node="child" />
      </ul>
    </li>
  `,
})

const typeLabel = (value: string) =>
  value.startsWith('enum:')
    ? `enum (${value.slice('enum:'.length).split('|').join(' | ')})`
    : value === 'FirebaseTimestamp'
    ? 'FirebaseTimestamp'
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
