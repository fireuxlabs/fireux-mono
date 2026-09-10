<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the authored Werkbox ecosystem overview. -->
<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: keep future practical-work copy product-neutral. -->
<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/ecosystems" variant="link" class="px-0">
          Ecosystems
        </UButton>
        <UPageHeader
          title="Werkbox"
          description="Shared tools and services for people who do practical work."
          headline="FireUX ecosystem"
        />
        <UPageBody class="space-y-4">
          <UCard variant="subtle">
            <template #header>
              <h2 class="text-lg font-semibold text-highlighted">
                Start in the shared app
              </h2>
            </template>

            <p class="text-muted">
              Use Werkbox before paying for a dedicated app. Start free, upgrade
              when the shared tools earn their place in your business, and move
              to your own branded app later if needed.
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
              <h2 class="text-xl font-semibold text-highlighted">
                Werkbox Apps
              </h2>
              <p class="text-sm leading-6 text-muted">
                Active Apps connected through Werkbox's existing Cleanbox
                storage identity in the bounded FireUX directory.
              </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <UPageCard
                v-for="app in publishedApps"
                :key="app.id"
                :title="app.name"
                :description="appSummary(app)"
                :to="`/apps/${encodeURIComponent(app.id)}`"
                icon="i-lucide-app-window"
                variant="subtle"
              />
            </div>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/ecosystems/werkbox/cleaning" icon="i-lucide-sparkles">
              Explore cleaning
            </UButton>
            <UButton to="/apps/cleanbox-app" color="neutral" variant="soft">
              View Werkbox
            </UButton>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type { PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import { useEcosystemApps } from 'fireux-core/runtime/ecosystem/composables/useEcosystemApps'

definePageMeta({
  layout: 'landing',
})

const { data } = await useAsyncData<PlatformDirectoryResponse>(
  'fireux-default-directory',
  () => $fetch('/api/directory'),
  { server: true, lazy: false }
)
const { apps } = useEcosystemApps('cleanbox')
const publishedApps = computed<App[]>(() =>
  apps.value
    .filter(
      (app: App) => app.status === 'active' && app.ecosystem_id === 'cleanbox'
    )
    .sort((left: App, right: App) => {
      if (left.role === 'global') return -1
      if (right.role === 'global') return 1
      return left.name.localeCompare(right.name)
    })
)
const appSummary = (app: App) =>
  app.tagline ||
  app.description ||
  `${app.name} is a published ${app.role === 'global' ? 'main App' : 'tenant App'} in the Werkbox Ecosystem.`

useSeo({
  title: 'Werkbox · FireUX Ecosystem',
  description:
    'Explore Werkbox cleaning services and the active Apps connected to the FireUX practical-work Ecosystem.',
  path: '/ecosystems/werkbox/explore',
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
          name: app.name,
          url: context.absoluteUrl(`/apps/${encodeURIComponent(app.id)}`),
        })),
      ],
    }),
})
</script>
