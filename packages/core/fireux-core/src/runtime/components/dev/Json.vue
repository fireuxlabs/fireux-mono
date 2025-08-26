<template>
  <div>
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      "
    >
      <h2 style="margin: 0">{{ title }}</h2>
      <UButton
        icon="i-heroicons-clipboard-document"
        size="sm"
        variant="outline"
        @click="copyToClipboard(jsonString)"
      >
        Copy JSON
      </UButton>
    </div>
    <pre>{{ jsonString }}</pre>
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: [Object, Array], required: true },
  title: { type: String, default: 'JSON' },
})

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
