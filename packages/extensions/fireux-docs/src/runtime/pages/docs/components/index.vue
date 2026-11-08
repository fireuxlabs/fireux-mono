<template>
  <UPage>
    <UPageHeader
      title="Component library"
      description="Useful Core building blocks for extending FireUX. Every component here has a working example."
    />
    <UPageBody>
      <p>
        Use <ULink to="https://ui.nuxt.com/docs/components">Nuxt UI</ULink>
        for the basic controls. FireUX adds shared editing, collection, feedback
        and workflow behaviour. Your feature keeps its data, permissions and
        commands.
      </p>
      <p>
        Examples use sample data and local actions. They do not save to your
        account.
      </p>
      <UInput
        v-model="search"
        aria-label="Search component library"
        placeholder="Search components…"
        icon="i-lucide-search"
      />
      <p role="status">{{ filtered.length }} components</p>
      <section
        v-for="group in groups"
        :key="group.name"
        class="core-library-group"
      >
        <h2 class="fx-type-section-title">{{ group.name }}</h2>
        <div class="core-library-grid">
          <UCard
            v-for="entry in group.entries"
            :key="entry.id"
            variant="subtle"
          >
            <h3>
              <ULink :to="`/docs/components/core/${entry.id}`">{{
                entry.name
              }}</ULink>
            </h3>
            <p>{{ entry.description }}</p>
            <template #footer>
              <UButton
                :to="`/docs/components/core/${entry.id}`"
                label="Preview and source"
                :aria-label="`Preview ${entry.name}`"
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-arrow-right"
              />
            </template>
          </UCard>
        </div>
      </section>
      <UAlert
        v-if="!filtered.length"
        title="No matching components"
        description="Try another name or purpose."
        color="neutral"
      />
      <section class="extension-library">
        <h2 class="fx-type-section-title">Extensions</h2>
        <p>Domain components stay with their owning extension.</p>
        <UButton
          to="/docs/components/bookings"
          label="Booking form preview"
          color="neutral"
          variant="soft"
        />
      </section>
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import library from '#build/fireux-public-components'
const search = ref('')
const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return library.filter((entry) =>
    `${entry.name} ${entry.description} ${entry.group}`
      .toLowerCase()
      .includes(query)
  )
})
const groups = computed(() =>
  [...new Set(filtered.value.map((entry) => entry.group))].map((name) => ({
    name,
    entries: filtered.value.filter((entry) => entry.group === name),
  }))
)
definePageMeta({ layout: 'docs', title: 'Component library' })
useSeoMeta({
  title: 'Component library · FireUX',
  description: 'Supported FireUX building blocks with sample-data previews.',
})
</script>
<style scoped>
.core-library-group,
.extension-library {
  margin-block: calc(var(--spacing) * 8);
}
.core-library-group h2,
.extension-library h2 {
  margin-bottom: calc(var(--spacing) * 4);
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
</style>
