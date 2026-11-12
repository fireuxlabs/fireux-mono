<template>
  <UContainer
    data-menu-projection="diagnostic"
    :data-menu-context="query?.context || undefined"
    :data-kitchen-slug="query?.kitchenSlug || undefined"
  >
    <FireState v-if="pending" entity="Menu" outcome="pending" />
    <UAlert
      v-else-if="error"
      title="Menu JSON unavailable"
      :description="error.message || 'The Menu projection could not be loaded.'"
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          :message="
            [
              'Menu JSON unavailable',
              error.message || 'The Menu projection could not be loaded.',
            ]
              .filter(Boolean)
              .join('\n')
          "
        />
      </template>
    </UAlert>
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
import { useAsyncData } from 'nuxt/app'

const props = defineProps<{
  endpoint: string
  query?: Record<string, string>
}>()

const { data, error, pending } = await useAsyncData(
  () => `menu-json-${props.endpoint}-${JSON.stringify(props.query ?? {})}`,
  async (_nuxtApp, { signal }) => {
    const fetchRead = $fetch.create({ signal, cache: 'no-store' })
    return fetchRead<unknown>(props.endpoint, { query: props.query })
  }
)
</script>
