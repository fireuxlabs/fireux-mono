<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the authored Werkbox ecosystem overview. -->
<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: keep future practical-work copy product-neutral. -->
<template>
  <PublicSimplePage
    title="Werkbox"
    description="Shared tools and services for people who do practical work."
    eyebrow="FireUX ecosystem"
    back-to="/ecosystems"
    back-label="Ecosystems"
  >
    <UCard variant="subtle">
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">
          Start in the shared app
        </h2>
      </template>

      <p class="text-muted">
        Use Werkbox before paying for a dedicated app. Start free, upgrade when
        the shared tools earn their place in your business, and move to your own
        branded app later if needed.
      </p>
    </UCard>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-highlighted">Services</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <UPageCard
          title="Cleaning"
          description="Run cleaning work and bring in extra capacity when a job gets bigger."
          icon="i-lucide-sparkles"
          to="/ecosystems/werkbox/cleaning"
          variant="subtle"
        />
      </div>
    </section>

    <section v-if="publishedApps.length" class="space-y-4">
      <div class="space-y-1">
        <h2 class="text-xl font-semibold text-highlighted">Werkbox Apps</h2>
        <p class="text-sm leading-6 text-muted">
          Active Apps connected through Werkbox's existing Cleanbox storage
          identity in the bounded FireUX directory.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <UPageCard
          v-for="app in publishedApps"
          :key="app.id"
          :title="app.app_name"
          :description="appSummary(app)"
          :to="app.detail_url"
          icon="i-lucide-app-window"
          variant="subtle"
        />
      </div>
    </section>

    <template #actions>
      <UButton to="/ecosystems/werkbox/cleaning" icon="i-lucide-sparkles">
        Explore cleaning
      </UButton>
      <UButton to="/apps/cleanbox-app" color="neutral" variant="soft">
        View Werkbox
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type {
  AppDirectoryEntry,
  PlatformDirectoryResponse,
} from 'fireux-core/runtime/models/utils/directory'

definePageMeta({
  layout: 'landing',
})

const { data } = await useAsyncData<PlatformDirectoryResponse>(
  'fireux-default-directory',
  () => $fetch('/api/directory'),
  { server: true, lazy: false }
)
const publishedApps = computed<AppDirectoryEntry[]>(() =>
  (data.value?.apps ?? [])
    .filter(
      (app: AppDirectoryEntry) =>
        app.status === 'active' && app.ecosystem_id === 'cleanbox'
    )
    .sort((left: AppDirectoryEntry, right: AppDirectoryEntry) => {
      if (left.role === 'global') return -1
      if (right.role === 'global') return 1
      return left.app_name.localeCompare(right.app_name)
    })
)
const appSummary = (app: AppDirectoryEntry) =>
  app.tagline ||
  app.short_bio ||
  app.description ||
  `${app.app_name} is a published ${app.role === 'global' ? 'main App' : 'tenant App'} in the Werkbox Ecosystem.`

useSeo({
  title: 'Werkbox · FireUX Ecosystem',
  description:
    'Explore Werkbox cleaning services and the active Apps connected to the FireUX practical-work Ecosystem.',
  path: '/ecosystems/werkbox',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: [
        {
          name: 'Cleaning',
          url: context.absoluteUrl('/ecosystems/werkbox/cleaning'),
        },
        ...publishedApps.value.map((app) => ({
          name: app.app_name,
          url: context.absoluteUrl(app.detail_url),
        })),
      ],
    }),
})
</script>
