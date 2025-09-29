<template>
  <div>
    <div class="devjson-header">
      <h2 class="devjson-title">{{ title }}</h2>
      <div class="devjson-actions">
        <UButton
          icon="i-heroicons-clipboard-document"
          size="sm"
          variant="outline"
          @click="copyToClipboard(jsonString)"
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

<script setup>import { ref, computed } from 'vue'

const props = defineProps({
  data: { type: [Object, Array], required: true },
  title: { type: String, default: 'JSON' },
  defaultOpen: { type: Boolean, default: false },
})

const expanded = ref(!!props.defaultOpen)

const jsonString = computed(() => {
  return JSON.stringify(props.data, null, 2)
})

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('JSON copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy JSON:', err)
  }
}
</script>

<style scoped>
.devjson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.devjson-title {
  margin: 0;
}
.devjson-actions {
  display: flex;
  gap: 8px;
}
pre {
  margin-top: 8px;
}
</style>
