<script setup lang="ts">
import { computed } from 'vue'
import { groupManifestEntries, type DocsEntry } from '~/utils/docsManifest'

const { data, pending, error } = await useAsyncData('docs-manifest', () =>
  $fetch<DocsEntry[]>('/api/docs-manifest')
)

const pathRoutes: Record<string, string> = {
  'docs/10-core/images.md': '/docs/images',
  'docs/10-core/figma.md': '/docs/figma',
}

const entryHref = (entry: DocsEntry) => pathRoutes[entry.path] ?? null

const groups = computed(() => {
  const entries = data.value ?? []
  return groupManifestEntries(entries)
})

useHead({
  title: 'FireUX Documentation Index',
})
</script>

<template>
  <main class="py-12">
    <UContainer>
      <header class="mb-8">
        <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          FireUX Documentation
        </h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">
          Library catalogue generated from <code>docs/_manifest.md</code>.
        </p>
      </header>

      <div v-if="pending" class="space-y-4">
        <USkeleton class="h-32" />
        <USkeleton class="h-32" />
      </div>

      <UAlert
        v-else-if="error"
        color="red"
        variant="subtle"
        icon="i-heroicons-exclamation-triangle"
        class="mb-6"
      >
        We couldn’t load the documentation manifest. Please check the server
        logs and retry.
      </UAlert>

      <div v-else class="space-y-10">
        <section v-for="group in groups" :key="group.heading" class="space-y-4">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {{ group.heading }}
          </h2>

          <div class="grid gap-3 md:grid-cols-2">
            <UCard
              v-for="entry in group.entries"
              :key="entry.path"
              class="border border-slate-200/70 dark:border-slate-700/60"
            >
              <div class="flex items-center justify-between gap-3">
                <NuxtLink
                  v-if="entryHref(entry)"
                  :to="entryHref(entry)"
                  class="truncate text-sm font-medium text-slate-900 underline decoration-slate-400 decoration-dotted underline-offset-4 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-200"
                >
                  <code
                    class="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
                  >
                    {{ entry.label }}
                  </code>
                </NuxtLink>
                <div
                  v-else
                  class="truncate text-sm font-medium text-slate-900 dark:text-slate-100"
                >
                  <code
                    class="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
                  >
                    {{ entry.label }}
                  </code>
                </div>

                <UBadge
                  v-if="entry.canonical"
                  color="emerald"
                  variant="soft"
                  size="xs"
                >
                  Canonical
                </UBadge>
              </div>
              <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {{ entry.path }}
              </p>
            </UCard>
          </div>
        </section>
      </div>
    </UContainer>
  </main>
</template>
