<template>
  <section v-if="featured.length" class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="space-y-1">
        <h2 class="text-2xl font-semibold text-highlighted">
          Featured ecosystems
        </h2>
        <p class="text-sm text-muted">
          Published ecosystem directory entries and their public websites.
        </p>
      </div>

      <UBadge color="neutral" variant="soft">
        {{ featured.length }} shown
      </UBadge>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="ecosystem in featured" :key="ecosystem.id" class="h-full">
        <template #header>
          <div class="flex items-start gap-3">
            <UAvatar
              :src="ecosystem.imageUrl || undefined"
              :alt="ecosystem.title"
              :text="ecosystem.title"
              icon="i-lucide-orbit"
              size="md"
            />

            <div class="min-w-0 flex-1">
              <h3 class="truncate text-base font-semibold text-highlighted">
                {{ ecosystem.title }}
              </h3>
              <p class="truncate text-sm text-muted">
                {{ ecosystem.id }}
              </p>
            </div>

            <UBadge color="success" variant="soft" size="xs">
              Published
            </UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <p class="line-clamp-3 text-sm text-muted">
            <span v-if="ecosystem.subtitle">{{
              ecosystem.subtitle
            }}</span>
            <span v-else class="italic">Description pending.</span>
          </p>

          <div class="flex flex-wrap gap-2">
            <UBadge color="neutral" variant="soft" size="xs">
              {{ ecosystem.meta }}
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
import type { EcosystemDirectoryEntry } from '../../models/utils/directory'
import { useEcosystemView } from '../composables/useEcosystemView'

const props = withDefaults(
  defineProps<{
    collection?: EcosystemDirectoryEntry[]
    featuredSlugs?: string[]
  }>(),
  {
    collection: () => [],
    featuredSlugs: () => [],
  }
)

const { toDirectoryCard } = useEcosystemView()

const featured = computed(() =>
  props.featuredSlugs
    .map((slug) => props.collection.find((entry) => entry.id === slug))
    .filter(
      (entry): entry is EcosystemDirectoryEntry =>
        entry !== undefined && entry.status === 'active'
    )
    .map((entry) => {
      const card = toDirectoryCard(entry)
      return {
        ...card,
        sourceUrl: entry.website_url,
      }
    })
)
</script>
