<template>
  <section v-if="featured.length" class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="space-y-1">
        <h2 class="text-2xl font-semibold text-highlighted">Featured ecosystems</h2>
        <p class="text-sm text-muted">
          Public ecosystem identities with their main app links.
        </p>
      </div>

      <UBadge color="neutral" variant="soft">
        {{ featured.length }} shown
      </UBadge>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UCard
        v-for="ecosystem in featured"
        :key="ecosystem.id"
        class="h-full"
      >
        <template #header>
          <div class="flex items-start gap-3">
            <UAvatar
              :src="ecosystem.imageUrl || undefined"
              :alt="ecosystem.name"
              :text="ecosystem.name"
              icon="i-lucide-orbit"
              size="md"
            />

            <div class="min-w-0 flex-1">
              <h3 class="truncate text-base font-semibold text-highlighted">
                {{ ecosystem.name }}
              </h3>
              <p class="truncate text-sm text-muted">
                {{ ecosystem.slug }}
              </p>
            </div>

            <UBadge color="success" variant="soft" size="xs">
              Published
            </UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <p class="line-clamp-3 text-sm text-muted">
            <span v-if="ecosystem.description">{{ ecosystem.description }}</span>
            <span v-else class="italic">Description pending.</span>
          </p>

          <div class="flex flex-wrap gap-2">
            <UBadge color="neutral" variant="soft" size="xs">
              {{ ecosystem.appCount }} app{{ ecosystem.appCount === 1 ? '' : 's' }}
            </UBadge>
            <UBadge v-if="ecosystem.team" color="neutral" variant="soft" size="xs">
              {{ ecosystem.team }}
            </UBadge>
          </div>
        </div>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton
              :to="ecosystem.to"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-lucide-orbit"
            >
              View ecosystem
            </UButton>
            <UButton
              v-if="ecosystem.sourceUrl"
              :to="ecosystem.sourceUrl"
              target="_blank"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-external-link"
            >
              Open app
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EcosystemInterfaceInput } from '../../../composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'

const props = withDefaults(defineProps<{
  collection?: EcosystemInterfaceInput[]
  featuredSlugs?: string[]
}>(), {
  collection: () => [],
  featuredSlugs: () => [],
})

const clean = (value: unknown) => String(value ?? '').trim()
const countApps = (apps: unknown, appCount?: number) => {
  if (Array.isArray(apps)) return apps.length
  if (Number.isFinite(Number(appCount))) return Number(appCount)
  if (Number.isFinite(Number(apps))) return Number(apps)
  return 0
}

const featured = computed(() =>
  props.featuredSlugs
    .map((slug) => clean(slug))
    .filter(Boolean)
    .map((slug) =>
      props.collection.find((entry) => clean(entry.slug) === slug)
    )
    .filter((entry): entry is EcosystemInterfaceInput => Boolean(entry))
    .filter((entry) => clean(entry.status) === 'active')
    .map((entry) => {
      const id = clean(entry.id)
      const slug = clean(entry.slug)

      return {
        id,
        slug,
        name: clean(entry.name) || id,
        description: clean(entry.description),
        imageUrl: clean(entry.image_url || entry.src),
        sourceUrl: clean(entry.source_url || entry.href),
        team: clean(entry.team),
        appCount: countApps(entry.apps, entry.appCount),
        to: slug ? `/ecosystems/${encodeURIComponent(slug)}` : '',
      }
    })
    .filter((entry) => entry.id && entry.slug)
)
</script>
