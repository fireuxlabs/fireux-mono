<template>
  <UCard :ui="{ body: 'space-y-2' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {{ title }}
        </div>
      </div>
    </template>

    <ul class="space-y-1 text-sm">
      <ShapeRow
        v-for="node in nodes"
        :key="node.key"
        :node="node"
      />
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'DevModelShape' })

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
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    ShapeRow: defineComponent({
      name: 'DevModelShapeRow',
      props: {
        node: {
          type: Object as () => {
            key: string
            type: string
            children?: { key: string; type: string; children?: any[] }[]
          },
          required: true,
        },
      },
      setup(props) {
        const typeLabel = (value: string) =>
          value.startsWith('enum:')
            ? `enum (${value.slice('enum:'.length).split('|').join(' | ')})`
            : value

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

        return { typeLabel, typeClass }
      },
      template: `
        <li>
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-900 dark:text-gray-100">{{ node.key }}</span>
            <span class="text-gray-400">:</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="typeClass(node.type)">
              {{ typeLabel(node.type) }}
            </span>
          </div>
          <ul v-if="node.children?.length" class="mt-1 ml-4 border-l border-gray-200 pl-3 space-y-1">
            <DevModelShapeRow v-for="child in node.children" :key="child.key" :node="child" />
          </ul>
        </li>
      `,
    }),
  },
})
</script>
