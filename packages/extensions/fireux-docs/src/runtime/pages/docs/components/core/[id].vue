<template>
  <UPage v-if="entry">
    <UPageHeader
      :title="entry.name"
      :description="`${entry.scope} · ${entry.source}`"
    >
      <template #links
        ><UButton
          to="/docs/components"
          label="All Core components"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
      /></template>
    </UPageHeader>
    <UPageBody>
      <section id="preview" class="core-component-section">
        <h2>Preview</h2>
        <p v-if="entry.preview">
          Sample data and local actions. Nothing here saves to your account.
        </p>
        <NuxtErrorBoundary v-if="entry.preview" :key="entry.id">
          <UCard variant="subtle"><DocsCorePreview :name="entry.name" /></UCard>
          <template #error="{ error, clearError }">
            <UAlert
              title="This preview could not render"
              :description="error.message"
              color="error"
            >
              <template #actions
                ><UButton label="Retry preview" @click="clearError"
              /></template>
            </UAlert>
          </template>
        </NuxtErrorBoundary>
        <UAlert
          v-else
          title="Source available"
          description="This component has no isolated live preview yet. Its current source is included below. Connected screens need their surrounding App, session, data or parent composition."
          icon="i-lucide-panels-top-left"
          color="neutral"
          variant="subtle"
        />
        <p v-if="!entry.registered">
          This source is not registered by this App. It may be replaced by an
          App-owned component.
        </p>
      </section>
      <section class="core-component-section">
        <h2>Source</h2>
        <p>
          The actual Core component, including its props, slots and
          dependencies.
        </p>
        <ULink :to="sourceUrl" target="_blank">Open on GitHub</ULink>
        <UCard variant="subtle">
          <pre class="core-component-code"><code>{{ entry.code }}</code></pre>
        </UCard>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import inventory from '#build/fireux-core-inventory'
const route = useRoute()
const entry = computed(() =>
  inventory.find((item) => item.id === route.params.id)
)
if (!entry.value)
  throw createError({ statusCode: 404, statusMessage: 'Component not found' })
const sourceUrl = computed(
  () =>
    `https://github.com/fireuxlabs/fireux-mono/blob/main/packages/core/fireux-core/src/runtime/${entry.value?.source}`
)
definePageMeta({ layout: 'docs', title: 'Core component' })
useSeoMeta({
  title: computed(() => `${entry.value?.name || 'Component'} · FireUX`),
  description: 'Current Core source and component preview.',
})
</script>

<style scoped>
.core-component-section {
  display: grid;
  gap: calc(var(--spacing) * 4);
  margin-block: calc(var(--spacing) * 6);
}
.core-component-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
}
.core-component-code {
  max-height: 36rem;
  overflow: auto;
  white-space: pre;
  font-size: 0.8125rem;
}
</style>
