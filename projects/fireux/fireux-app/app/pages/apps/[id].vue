<!-- Concurrent edit — 2026-07-22 13:03 CEST — Origin-aware Ignition pipelines: turn published App examples into attributed Ignition entry points. -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #links>
        <UButton v-if="app" size="xs" icon="i-lucide-rocket" :to="ignitionTo">
          Start an app like this
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/apps"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UAlert
        v-if="pending"
        color="neutral"
        variant="soft"
        title="Loading app"
      />

      <UAlert
        v-else-if="failed"
        color="error"
        variant="soft"
        title="App unavailable"
        description="This directory entry could not be loaded. Please try again."
      />

      <UAlert
        v-else-if="missing"
        color="warning"
        variant="soft"
        title="App not found"
        description="No published App directory entry matches this id or slug."
      />

      <AppCardsProfile
        v-else-if="profile"
        :model="profile"
        :show-details="false"
        :show-people="false"
        :show-socials="false"
      />

      <UCard v-if="app" class="mt-6" variant="subtle">
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">
            {{ relationshipTitle }}
          </h2>
        </template>

        <p class="text-sm leading-6 text-muted">
          {{ relationshipDescription }}
        </p>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="ecosystem"
              :to="ecosystem.detail_url"
              color="neutral"
              variant="soft"
              icon="i-lucide-orbit"
            >
              View {{ ecosystem.name }}
            </UButton>
            <UButton
              v-if="app.role === 'global' && ecosystem?.website_url"
              :to="ecosystem.website_url"
              target="_blank"
              icon="i-lucide-external-link"
            >
              Visit {{ app.app_name }}
            </UButton>
            <UButton
              v-if="!ecosystem"
              to="/apps"
              color="neutral"
              variant="soft"
              icon="i-lucide-app-window"
            >
              Browse FireUX Apps
            </UButton>
          </div>
        </template>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useAppProfileView } from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppProfileView'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type {
  AppDirectoryEntry,
  EcosystemDirectoryEntry,
  PlatformDirectoryResponse,
} from 'fireux-core/runtime/models/utils/directory'
import { isDirectoryAppIndexable } from '../../utils/directorySearchPolicy'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'View a published FireUX App directory projection.',
  name: 'FireuxAppDirectoryDetailPage',
})

const routeId = useRouteParam('id')
const { data, pending, error } = await useAsyncData<PlatformDirectoryResponse>(
  'fireux-platform-directory',
  () => $fetch('/api/public/directory'),
  { server: true, lazy: false }
)
const app = computed<AppDirectoryEntry | null>(
  () =>
    data.value?.apps.find(
      (entry: AppDirectoryEntry) =>
        entry.id === routeId.value || entry.slug === routeId.value
    ) ?? null
)
const ecosystem = computed<EcosystemDirectoryEntry | null>(() => {
  const ecosystemId = app.value?.ecosystem_id
  if (!ecosystemId) return null
  return (
    data.value?.ecosystems.find(
      (entry: EcosystemDirectoryEntry) => entry.id === ecosystemId
    ) ?? null
  )
})
const statusCode = computed(() =>
  Number(
    (error.value as any)?.statusCode ||
      (error.value as any)?.status ||
      (error.value as any)?.response?.status ||
      0
  )
)
const missing = computed(() => !pending.value && !error.value && !app.value)
const failed = computed(() => Boolean(error.value))

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 500 ? statusCode.value : 503)
  }
}

const { model: profile } = useAppProfileView(app)
const pageTitle = computed(() => app.value?.app_name || 'App')
const seoTitle = computed(() =>
  app.value ? `${app.value.app_name} · FireUX App` : 'FireUX App'
)
const roleLabel = computed(() => {
  if (app.value?.role === 'global') return 'main App'
  if (app.value?.role === 'tenant') return 'tenant App'
  if (app.value?.role === 'standalone') return 'standalone App'
  return 'App'
})
const pageDescription = computed(
  () =>
    app.value?.description ||
    app.value?.short_bio ||
    app.value?.tagline ||
    (app.value
      ? `${app.value.app_name} is a published ${roleLabel.value} in the FireUX App directory.`
      : 'Published FireUX App directory projection.')
)
const relationshipTitle = computed(() =>
  ecosystem.value ? `Part of ${ecosystem.value.name}` : 'Independent FireUX App'
)
const relationshipDescription = computed(() => {
  if (ecosystem.value) {
    return `${app.value?.app_name || 'This App'} is a ${roleLabel.value} in the ${ecosystem.value.name} Ecosystem.`
  }
  return `${app.value?.app_name || 'This App'} is published directly in the FireUX platform directory without an Ecosystem parent.`
})
const ignitionTo = computed(() => {
  const example = app.value?.slug || app.value?.id || routeId.value
  return `/get-started?example=${encodeURIComponent(example)}`
})
const canonicalPath = computed(
  () => app.value?.detail_url || `/apps/${encodeURIComponent(routeId.value)}`
)
const isIndexable = computed(() =>
  Boolean(app.value && isDirectoryAppIndexable(app.value.id))
)

useSeo({
  title: seoTitle,
  description: pageDescription,
  path: canonicalPath,
  image: computed(
    () =>
      app.value?.media.cover_url || app.value?.media.thumbnail_url || undefined
  ),
  robots: computed(() =>
    isIndexable.value ? 'index, follow' : 'noindex, nofollow'
  ),
  jsonLdBuilder: (context) => {
    if (!isIndexable.value || !app.value) return null

    return buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
      items: ecosystem.value
        ? [
            {
              name: ecosystem.value.name,
              url: context.absoluteUrl(ecosystem.value.detail_url),
            },
          ]
        : [],
    })
  },
})
</script>
