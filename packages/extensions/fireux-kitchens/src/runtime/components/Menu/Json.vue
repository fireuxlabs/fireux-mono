<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-8">
    <p v-if="pending">Loading menu JSON...</p>
    <pre v-else-if="error">{{ errorJson }}</pre>
    <pre v-else>{{ outputJson }}</pre>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  endpoint: string
  query?: Record<string, string> | undefined
}>(), {
  query: undefined,
})

const { data, error, pending } = await useAsyncData(
  () => `menu-json-${props.endpoint}-${JSON.stringify(props.query ?? {})}`,
  () => $fetch<unknown>(props.endpoint, { query: props.query })
)
const outputJson = computed(() => JSON.stringify(data.value, null, 2))
const errorJson = computed(() => JSON.stringify({
  error: true,
  message: error.value?.message || 'Menu JSON unavailable.',
  statusCode: error.value?.statusCode || 500,
}, null, 2))
</script>

<style scoped>
pre {
  overflow: auto;
  margin: 0;
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  background: var(--ui-bg-muted);
  font: 0.8125rem/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
