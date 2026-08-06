<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          v-if="ecosystem?.website_url"
          size="xs"
          icon="i-lucide-external-link"
          :to="ecosystem.website_url"
          target="_blank"
        >
          Visit {{ ecosystem.name }}
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/ecosystems"
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
        title="Loading ecosystem"
      />

      <UAlert
        v-else-if="failed"
        color="error"
        variant="soft"
        title="Ecosystem unavailable"
        description="This ecosystem could not be loaded. Please try again."
      />

      <UAlert
        v-else-if="!ecosystem"
        color="warning"
        variant="soft"
        title="Ecosystem not found"
        description="No published Ecosystem projection matches this slug."
      />

      <EcosystemCardsProfile v-else-if="profile" :item="profile" />

      <section v-if="ecosystem && ecosystemApps.length" class="mt-8 space-y-4">
        <div class="space-y-1">
          <h2 class="text-xl font-semibold text-highlighted">
            Apps in {{ ecosystem.name }}
          </h2>
          <p class="text-sm leading-6 text-muted">
            Active Apps connected to this Ecosystem in the bounded FireUX public
            directory.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UPageCard
            v-for="app in ecosystemApps"
            :key="app.id"
            :title="app.app_name"
            :description="appSummary(app)"
            :to="app.detail_url"
            icon="i-lucide-app-window"
            variant="subtle"
          />
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useEcosystemInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type {
  AppDirectoryEntry,
  EcosystemDirectoryEntry,
  PlatformDirectoryResponse,
} from 'fireux-core/runtime/models/utils/directory'

definePageMeta({
  layout: 'default',
  title: 'Ecosystem',
  description: 'View a published FireUX Ecosystem projection.',
  name: 'FireuxEcosystemDetailPage',
})

const routeSlug = useRouteParam('slug')

if (routeSlug.value === 'cleanbox') {
  await navigateTo('/ecosystems/werkbox', {
    redirectCode: 301,
    replace: true,
  })
}

const { data, pending, error } = await useAsyncData<PlatformDirectoryResponse>(
  'fireux-default-directory',
  () => $fetch('/api/public/directory'),
  { server: true, lazy: false }
)
const ecosystems = computed(() => data.value?.ecosystems ?? [])
const { profile: makeProfile } = useEcosystemInterface()
const ecosystem = computed(
  () =>
    ecosystems.value.find(
      (entry: EcosystemDirectoryEntry) =>
        entry.slug === routeSlug.value || entry.id === routeSlug.value
    ) ?? null
)
const ecosystemApps = computed<AppDirectoryEntry[]>(() => {
  const ecosystemId = ecosystem.value?.id
  if (!ecosystemId) return []
  return (data.value?.apps ?? [])
    .filter(
      (entry: AppDirectoryEntry) =>
        entry.status === 'active' && entry.ecosystem_id === ecosystemId
    )
    .sort((left: AppDirectoryEntry, right: AppDirectoryEntry) => {
      if (left.role === 'global') return -1
      if (right.role === 'global') return 1
      return left.app_name.localeCompare(right.app_name)
    })
})
const statusCode = computed(() =>
  Number(
    (error.value as any)?.statusCode ||
      (error.value as any)?.status ||
      (error.value as any)?.response?.status ||
      0
  )
)
const missing = computed(
  () => !pending.value && !error.value && !ecosystem.value
)
const failed = computed(() => Boolean(error.value))

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 500 ? statusCode.value : 503)
  }
}
const profile = computed(() => {
  const entry = ecosystem.value
  if (!entry) return null
  return makeProfile({
    ...entry,
    appCount: entry.app_count,
    href: entry.detail_url,
  })
})
const pageTitle = computed(() => ecosystem.value?.name || 'Ecosystem')
const pageDescription = computed(
  () => ecosystem.value?.description || 'Published FireUX Ecosystem projection.'
)
const canonicalPath = computed(
  () => ecosystem.value?.detail_url || `/ecosystems/${routeSlug.value}`
)
const appSummary = (app: AppDirectoryEntry) =>
  app.tagline ||
  app.short_bio ||
  app.description ||
  `${app.app_name} is a published ${app.role === 'global' ? 'main App' : 'App'} in the ${ecosystem.value?.name || 'current'} Ecosystem.`

useSeo({
  title: computed(() =>
    ecosystem.value
      ? `${ecosystem.value.name} · FireUX Ecosystem`
      : pageTitle.value
  ),
  description: pageDescription,
  path: canonicalPath,
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
        ...(ecosystem.value.website_url
          ? [
              {
                name: ecosystem.value.name,
                url: ecosystem.value.website_url,
              },
            ]
          : []),
        ...ecosystemApps.value.map((app) => ({
          name: app.app_name,
          url: context.absoluteUrl(app.detail_url),
        })),
      ],
    })
  },
})
</script>
