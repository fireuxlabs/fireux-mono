<template>
  <main
    class="mx-auto w-full max-w-6xl px-4 py-8"
    data-menu-projection="diagnostic"
    :data-menu-context="props.query?.context || undefined"
    :data-kitchen-slug="props.query?.kitchenSlug || undefined"
  >
    <p v-if="pending">Loading menu JSON...</p>
    <pre v-else-if="error">{{ errorJson }}</pre>
    <template v-else>
      <div class="mb-3 flex items-center justify-end gap-3">
        <span v-if="copyStatus" class="text-sm text-muted">
          {{ copyStatus }}
        </span>
        <UButton
          icon="i-lucide-copy"
          color="neutral"
          variant="soft"
          @click="copyJson"
        >
          Copy JSON
        </UButton>
      </div>
      <pre>{{ outputJson }}</pre>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

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
const copyStatus = ref('')
const errorJson = computed(() => JSON.stringify({
  error: true,
  message: error.value?.message || 'Menu JSON unavailable.',
  statusCode: error.value?.statusCode || 500,
}, null, 2))

async function copyJson() {
  try {
    await navigator.clipboard.writeText(outputJson.value)
    copyStatus.value = 'Copied'
  } catch {
    copyStatus.value = 'Copy failed'
  }
}
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
