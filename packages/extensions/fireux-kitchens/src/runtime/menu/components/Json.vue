<template>
  <UContainer
    class="py-8"
    data-menu-projection="diagnostic"
    :data-menu-context="query?.context || undefined"
    :data-kitchen-slug="query?.kitchenSlug || undefined"
  >
    <FireStateCard v-if="pending" entity="Menu" kind="document" loading />
    <FireStateCard
      v-else-if="error"
      entity="Menu"
      kind="document"
      state="error"
      title="Menu JSON unavailable"
      :description="error.message || 'The Menu projection could not be loaded.'"
    />
    <FireDiagnosticsDebugPanel
      v-else
      title="Menu projection"
      :objects="data"
      :derived="{ endpoint, query }"
      object-origin="fetched"
      :default-open="true"
      :hide-when-empty="false"
      include-route
    />
  </UContainer>
</template>

<script setup lang="ts">
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'

const props = defineProps<{
  endpoint: string
  query?: Record<string, string>
}>()

const { data, error, pending } = await useLiveAsyncData(
  () => `menu-json-${props.endpoint}-${JSON.stringify(props.query ?? {})}`,
  (liveFetch) => liveFetch<unknown>(props.endpoint, { query: props.query })
)
</script>
