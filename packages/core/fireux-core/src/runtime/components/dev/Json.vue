<template>
  <div v-if="shouldRender">
    <div class="jsonpanel-header">
      <h2 class="jsonpanel-title">{{ title }}</h2>
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
          :icon="expanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          size="sm"
          variant="ghost"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Hide' : 'Show' }} JSON
        </UButton>
      </div>
    </div>
    <pre v-if="expanded">{{ jsonString }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'

defineOptions({ name: 'Json' })

interface JsonPanelProps {
  data: unknown
  title?: string
  defaultOpen?: boolean
  hideWhenEmpty?: boolean
}

const props = withDefaults(defineProps<JsonPanelProps>(), {
  title: 'JSON',
  defaultOpen: false,
  hideWhenEmpty: true,
})

const expanded = ref(props.defaultOpen)
const isEmpty = computed(() => {
  const value = props.data as any
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  if (typeof value === 'string') return value.length === 0
  return false
})

const shouldRender = computed(() => !props.hideWhenEmpty || !isEmpty.value)
const jsonString = computed(() => {
  try {
    return JSON.stringify(props.data, null, 2)
  } catch {
    return '[Json] Unable to stringify data'
  }
})

const lastCopyResult = ref<'idle' | 'copied' | 'failed'>('idle')
const copyLabel = computed(() => {
  if (copying.value) return 'Copying…'
  if (lastCopyResult.value === 'copied') return 'Copied'
  if (lastCopyResult.value === 'failed') return 'Copy failed'
  return 'Copy JSON'
})

const { copyJSON, copying } = useDevClipboard()

const onCopy = async () => {
  const ok = await copyJSON(props.data, {
    label: props.title,
  })

  lastCopyResult.value = ok ? 'copied' : 'failed'
  window.setTimeout(() => {
    lastCopyResult.value = 'idle'
  }, 1200)
}
</script>

<style scoped>
.jsonpanel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.jsonpanel-title {
  margin: 0;
}

.jsonpanel-actions {
  display: flex;
  gap: 8px;
}

pre {
  margin-top: 8px;
}
</style>
