<template>
  <UPage>
    <UPageHeader
      title="Core components"
      description="Everything currently in Core, including the smaller helpers and connected screens."
    />
    <UPageBody>
      <p>
        {{ inventory.length }} components: {{ sharedCount }} shared Fire
        components and {{ inventory.length - sharedCount }} App, User, Ecosystem
        and Workspace components. {{ previewCount }} have sample-data previews.
        The rest show their source. Connected screens need their owning App
        context.
      </p>
      <p>
        Use <ULink to="https://ui.nuxt.com/docs/components">Nuxt UI</ULink> for
        the basic controls. This inventory shows what is in FireUX today; being
        listed does not mean it should stay in Core.
      </p>
      <div class="core-library-filters">
        <UInput
          v-model="search"
          aria-label="Search Core components"
          placeholder="Search names or folders…"
          icon="i-lucide-search"
        />
        <USelect v-model="scope" :items="scopes" aria-label="Component owner" />
        <USwitch v-model="previewsOnly" label="With previews" />
      </div>
      <p role="status">
        {{ filtered.length }}
        {{ filtered.length === 1 ? 'component' : 'components' }} shown
      </p>
      <section
        v-for="group in groups"
        :key="group.name"
        class="core-library-group"
      >
        <h2 class="fx-type-section-title">
          {{ group.name }} <span>({{ group.entries.length }})</span>
        </h2>
        <div class="core-library-grid">
          <UCard
            v-for="entry in group.entries"
            :key="entry.id"
            variant="subtle"
          >
            <h3 class="fx-type-card-heading">
              <ULink :to="`/docs/components/core/${entry.id}`">{{
                entry.name
              }}</ULink>
            </h3>
            <p class="core-library-path">{{ entry.source }}</p>
            <template #footer>
              <div class="core-library-card-footer">
                <UBadge
                  :color="entry.preview ? 'success' : 'neutral'"
                  variant="subtle"
                  >{{ entry.preview ? 'Live preview' : 'Source only' }}</UBadge
                >
                <UButton
                  :to="`/docs/components/core/${entry.id}`"
                  :label="entry.preview ? 'Preview' : 'Inspect'"
                  :aria-label="`${entry.preview ? 'Preview' : 'Inspect'} ${entry.name}`"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  trailing-icon="i-lucide-arrow-right"
                />
              </div>
            </template>
          </UCard>
        </div>
      </section>
      <UAlert
        v-if="!filtered.length"
        title="No matching components"
        description="Try a different name or owner, or turn off the preview filter."
        color="neutral"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import inventory from '#build/fireux-core-inventory'

const search = ref('')
const scope = ref('Shared')
const previewsOnly = ref(false)
const scopes = ['All Core', 'Shared', 'App', 'User', 'Ecosystem', 'Workspace']
const sharedCount = inventory.filter((entry) => entry.scope === 'Shared').length
const previewCount = inventory.filter((entry) => entry.preview).length
const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return inventory.filter(
    (entry) =>
      (scope.value === 'All Core' || entry.scope === scope.value) &&
      (!previewsOnly.value || entry.preview) &&
      (!query || `${entry.name} ${entry.source}`.toLowerCase().includes(query))
  )
})
const groups = computed(() =>
  [...new Set(filtered.value.map((entry) => entry.group))].map((name) => ({
    name,
    entries: filtered.value.filter((entry) => entry.group === name),
  }))
)

definePageMeta({ layout: 'docs', title: 'Core components' })
useSeoMeta({
  title: 'Core components · FireUX',
  description:
    'Browse the current Core components, sample-data previews and source.',
})
</script>

<style scoped>
.core-library-filters,
.core-library-card-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}
.core-library-filters {
  margin-block: calc(var(--spacing) * 6);
}
.core-library-card-footer {
  justify-content: space-between;
}
.core-library-group {
  margin-block: calc(var(--spacing) * 8);
}
.core-library-group h2 {
  margin-bottom: calc(var(--spacing) * 4);
  font-size: 1.25rem;
  font-weight: 600;
}
.core-library-group h2 span,
.core-library-path {
  color: var(--ui-text-muted);
  font-size: 0.875rem;
}
.core-library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
  gap: calc(var(--spacing) * 4);
}
.core-library-grid h3 {
  font-weight: 600;
  overflow-wrap: anywhere;
}
.core-library-path {
  margin-top: calc(var(--spacing) * 2);
  overflow-wrap: anywhere;
}
</style>
