<template>
  <div>
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
          Copy JSON
        </UButton>
        <UButton
          :icon="
            expanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
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

defineOptions({ name: 'DevJsonPanel' })

interface JsonPanelProps {
  data: unknown
  title?: string
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<JsonPanelProps>(), {
  title: 'JSON',
  defaultOpen: false,
})

const expanded = ref(props.defaultOpen)
const jsonString = computed(() => JSON.stringify(props.data, null, 2))

const { copyJSON, copying } = useDevClipboard()

const onCopy = async () => {
  await copyJSON(props.data, {
    label: props.title,
  })
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
