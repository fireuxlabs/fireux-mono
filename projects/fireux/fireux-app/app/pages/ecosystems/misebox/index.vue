<template>
  <PublicSimplePage
    v-if="ecosystem"
    :title="miseboxEcosystemProfile.title"
    :description="miseboxEcosystemProfile.description"
    :eyebrow="miseboxEcosystemProfile.eyebrow"
    back-to="/ecosystems"
    back-label="Ecosystems"
  >
    <section class="grid gap-4">
      <div class="grid gap-1">
        <h2 class="m-0 text-xl font-semibold text-highlighted">
          FireUX and Misebox
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          FireUX is the parent platform. Misebox is the hospitality Ecosystem
          that owns its products, operations, and Apps.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UPageCard
          v-for="item in miseboxEcosystemProfile.relationship"
          :key="item.title"
          :title="item.title"
          :description="item.description"
          :icon="item.icon"
          variant="subtle"
        />
      </div>
    </section>

    <section class="grid gap-4">
      <div class="grid gap-1">
        <h2 class="m-0 text-xl font-semibold text-highlighted">
          Explore Misebox
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          Continue to the canonical Misebox pages for hospitality products and
          published records.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UPageCard
          v-for="pathway in miseboxEcosystemProfile.pathways"
          :key="pathway.to"
          :title="pathway.title"
          :description="pathway.description"
          :icon="pathway.icon"
          :to="pathway.to"
          target="_blank"
          variant="subtle"
        />
      </div>
    </section>

    <section v-if="featuredSolutions.length" class="grid gap-4">
      <div class="grid gap-1">
        <h2 class="m-0 text-xl font-semibold text-highlighted">
          Released Misebox solutions
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          These pages describe released jobs using the current Misebox Solution
          catalogue. Planned work is not presented as available.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UPageCard
          v-for="solution in featuredSolutions"
          :key="solution.slug"
          :title="solution.title"
          :description="solution.description"
          :icon="solution.icon"
          :to="`https://misebox.app/solutions/${solution.slug}`"
          target="_blank"
          variant="subtle"
        />
      </div>
    </section>

    <section v-if="publishedApps.length" class="grid gap-4">
      <div class="grid gap-1">
        <h2 class="m-0 text-xl font-semibold text-highlighted">
          Published Misebox Apps
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          Current Apps connected to Misebox in the bounded FireUX public
          directory. App-owned descriptions appear when their owners publish
          them.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UCard v-for="app in publishedApps" :key="app.id" variant="subtle">
          <div class="flex items-start gap-4">
            <img
              v-if="app.media.logo_url"
              :src="app.media.logo_url"
              :alt="`${app.app_name} logo`"
              width="48"
              height="48"
              loading="lazy"
              class="size-12 shrink-0 rounded-lg object-contain"
            />
            <div class="min-w-0 flex-1 space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="m-0 font-semibold text-highlighted">
                  <NuxtLink :to="app.detail_url" class="hover:underline">
                    {{ app.app_name }}
                  </NuxtLink>
                </h3>
                <UBadge color="neutral" variant="soft" size="sm">
                  {{ appRoleLabel(app.role) }}
                </UBadge>
              </div>
              <p class="m-0 text-sm leading-6 text-muted">
                {{ appSummary(app) }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </section>

    <template #actions>
      <UButton
        :to="miseboxEcosystemProfile.websiteUrl"
        target="_blank"
        icon="i-lucide-external-link"
      >
        Visit Misebox
      </UButton>
      <UButton to="/ecosystems" color="neutral" variant="soft">
        Browse Ecosystems
      </UButton>
    </template>
  </PublicSimplePage>

  <UContainer v-else class="py-12">
    <UAlert
      v-if="pending"
      color="neutral"
      variant="soft"
      title="Loading Misebox"
    />
    <UAlert
      v-else-if="failed"
      color="error"
      variant="soft"
      title="Misebox unavailable"
      description="The public Ecosystem directory could not be loaded. Please try again."
    />
    <UAlert
      v-else
      color="warning"
      variant="soft"
      title="Misebox not published"
      description="No active Misebox Ecosystem is present in the public directory."
    />
  </UContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useAsyncData } from '#imports'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type {
  AppDirectoryEntry,
  EcosystemDirectoryEntry,
  PlatformDirectoryResponse,
} from 'fireux-core/runtime/models/utils/directory'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import { miseboxEcosystemProfile } from 'fireux-misebox/runtime/content/ecosystem-profile'
import { miseboxSolutions } from 'fireux-misebox/runtime/content/solutions'

definePageMeta({
  layout: 'landing',
  name: 'FireuxMiseboxEcosystemPage',
})

const { data, pending, error } = await useAsyncData<PlatformDirectoryResponse>(
  'fireux-misebox-public-directory',
  () => $fetch('/api/directory'),
  { server: true, lazy: false }
)

const ecosystem = computed(
  () =>
    data.value?.ecosystems.find(
      (entry: EcosystemDirectoryEntry) =>
        entry.status === 'active' && entry.id === 'misebox'
    ) ?? null
)
const publishedApps = computed<AppDirectoryEntry[]>(() =>
  (data.value?.apps ?? [])
    .filter(
      (entry: AppDirectoryEntry) =>
        entry.status === 'active' && entry.ecosystem_id === 'misebox'
    )
    .sort((left: AppDirectoryEntry, right: AppDirectoryEntry) => {
      if (left.role === 'global') return -1
      if (right.role === 'global') return 1
      return left.app_name.localeCompare(right.app_name)
    })
)
const featuredSolutionSlugs = new Set<string>(
  miseboxEcosystemProfile.featuredSolutionSlugs
)
const featuredSolutions = miseboxSolutions.filter(
  (solution) =>
    solution.status === 'live' && featuredSolutionSlugs.has(solution.slug)
)
const failed = computed(() => Boolean(error.value))
const statusCode = computed(() =>
  Number(
    (error.value as any)?.statusCode ||
      (error.value as any)?.status ||
      (error.value as any)?.response?.status ||
      0
  )
)

if (import.meta.server) {
  if (!pending.value && !error.value && !ecosystem.value) {
    setResponseStatus(404)
  } else if (error.value) {
    setResponseStatus(statusCode.value >= 500 ? statusCode.value : 503)
  }
}

const appRoleLabel = (role: App['role'] | '') => {
  if (role === 'global') return 'Ecosystem App'
  if (role === 'tenant') return 'Tenant App'
  if (role === 'standalone') return 'Standalone App'
  return 'Published App'
}

const appSummary = (app: AppDirectoryEntry) =>
  app.tagline.trim() ||
  app.short_bio.trim() ||
  app.description.trim() ||
  `A published ${appRoleLabel(app.role)} connected to the Misebox Ecosystem.`

useSeo({
  title: miseboxEcosystemProfile.seo.title,
  description: miseboxEcosystemProfile.seo.description,
  path: '/ecosystems/misebox',
  image: computed(() => ecosystem.value?.image_url || '/img/app/cover.png'),
  robots: computed(() =>
    ecosystem.value ? 'index, follow' : 'noindex, nofollow'
  ),
  jsonLdBuilder: (context) => {
    if (!ecosystem.value) return null

    return buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: [
        {
          name: 'Misebox',
          url: miseboxEcosystemProfile.websiteUrl,
        },
        ...miseboxEcosystemProfile.pathways.map((pathway) => ({
          name: pathway.title,
          url: pathway.to,
        })),
        ...featuredSolutions.map((solution) => ({
          name: solution.title,
          url: `https://misebox.app/solutions/${solution.slug}`,
        })),
        ...publishedApps.value.map((app) => ({
          name: app.app_name,
          url: context.absoluteUrl(app.detail_url),
        })),
      ],
    })
  },
})
</script>
