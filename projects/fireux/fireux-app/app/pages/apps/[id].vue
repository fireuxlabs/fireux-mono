<template>
  <UPage class="app-detail">
    <UPageBody>
      <CollectionDirectoryState v-if="pending" title="Loading App" description="Finding this App and its relationships…" icon="i-lucide-loader-circle" loading />
      <CollectionDirectoryState v-else-if="failed" title="App unavailable" description="This App could not be loaded. Please try again." icon="i-lucide-triangle-alert" />
      <CollectionDirectoryState v-else-if="missing" title="App not found" description="No published App matches this address." icon="i-lucide-app-window">
        <template #actions>
          <UButton to="/apps" icon="i-lucide-arrow-left" variant="soft">Browse Apps</UButton>
        </template>
      </CollectionDirectoryState>

      <template v-else-if="app">
        <header class="app-detail__hero">
          <div v-if="app.media.cover_url" class="app-detail__cover" :style="appHeroStyle" aria-hidden="true" />
          <div class="app-detail__shade" aria-hidden="true" />
          <div class="app-detail__topline">
            <UButton to="/apps" color="neutral" variant="soft" icon="i-lucide-arrow-left" size="sm">All Apps</UButton>
            <span class="app-detail__role">{{ roleLabel }}</span>
          </div>
          <div class="app-detail__identity">
            <UAvatar :src="app.media.logo_url || app.media.thumbnail_url || undefined" :text="app.name || app.id" :alt="app.name || app.id" size="3xl" class="app-detail__avatar" />
            <div>
              <p class="app-detail__eyebrow">FireUX App</p>
              <h1>{{ app.name || app.id }}</h1>
              <p v-if="app.tagline" class="app-detail__tagline">{{ app.tagline }}</p>
              <p class="app-detail__description">{{ pageDescription }}</p>
              <div class="app-detail__actions">
                <UButton icon="i-lucide-rocket" :to="ignitionTo">Start an App like this</UButton>
                <UButton v-if="app.role === 'global' && ecosystem?.website_url" :to="ecosystem.website_url" target="_blank" color="neutral" variant="soft" icon="i-lucide-external-link">Visit App</UButton>
              </div>
            </div>
          </div>
        </header>

        <section class="app-detail__section">
          <CollectionDirectoryHeader title="Where this App belongs" description="Canonical relationships from App.project_id and App.ecosystem_id." />
          <div class="app-detail__relationships">
            <NuxtLink v-if="project" :to="`/projects/${encodeURIComponent(project.id)}`" class="app-detail__relationship">
              <span class="app-detail__relationship-icon"><UIcon name="i-lucide-folder-kanban" aria-hidden="true" /></span>
              <div><p>Project</p><h2>{{ project.name || project.id }}</h2><span>{{ project.description }}</span></div>
              <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
            </NuxtLink>
            <div v-else class="app-detail__relationship app-detail__relationship--missing">
              <span class="app-detail__relationship-icon"><UIcon name="i-lucide-folder-x" aria-hidden="true" /></span>
              <div><p>Project</p><h2>{{ app.project_id || 'Not connected' }}</h2><span>No active Project directory entry matches this relationship.</span></div>
            </div>
            <NuxtLink v-if="ecosystem" :to="ecosystem.detail_url" class="app-detail__relationship">
              <span class="app-detail__relationship-icon"><UIcon name="i-lucide-orbit" aria-hidden="true" /></span>
              <div><p>Ecosystem</p><h2>{{ ecosystem.name }}</h2><span>{{ ecosystem.description }}</span></div>
              <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
            </NuxtLink>
            <div v-else class="app-detail__relationship app-detail__relationship--missing">
              <span class="app-detail__relationship-icon"><UIcon name="i-lucide-circle-off" aria-hidden="true" /></span>
              <div><p>Ecosystem</p><h2>Independent App</h2><span>This App has no active Ecosystem relationship.</span></div>
            </div>
          </div>
        </section>

        <DevDebugPanel object-origin="fetched" launcher include-route title="App (JSON)" context="Canonical App directory projection with Project and Ecosystem relationships derived separately" :objects="[app]" :derived="{ project, ecosystem }" :default-open="false" />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { buildPublicPageJsonLd, useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type { AppDirectoryEntry, EcosystemDirectoryEntry, PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory'
import { useProjectDirectory } from '../../composables/useProjectDirectory'
import { isDirectoryAppIndexable } from '../../utils/directorySearchPolicy'

definePageMeta({ layout: 'default', title: 'App', description: 'View a published FireUX App and its relationships.', name: 'FireuxAppDirectoryDetailPage' })

const routeId = useRouteParam('id')
const { data, pending: appPending, error } = await useAsyncData<PlatformDirectoryResponse>('fireux-default-directory', () => $fetch('/api/directory'), { server: true, lazy: false })
const projectDirectory = useProjectDirectory()
const app = computed<AppDirectoryEntry | null>(() => data.value?.apps.find((entry) => entry.id === routeId.value || entry.slug === routeId.value) ?? null)
const project = computed(() => projectDirectory.projects.value.find((entry) => entry.id === app.value?.project_id) ?? null)
const ecosystem = computed<EcosystemDirectoryEntry | null>(() => {
  const id = app.value?.ecosystem_id
  return id ? data.value?.ecosystems.find((entry) => entry.id === id) ?? null : null
})
const pending = computed(() => appPending.value || projectDirectory.pending.value)
const failed = computed(() => Boolean(error.value || projectDirectory.error.value))
const missing = computed(() => !pending.value && !failed.value && !app.value)

if (import.meta.server) {
  if (missing.value) setResponseStatus(404)
  else if (failed.value) setResponseStatus(503)
}

const roleLabel = computed(() => app.value?.role === 'global' ? 'Main App' : app.value?.role === 'tenant' ? 'Tenant App' : app.value?.role === 'standalone' ? 'Standalone App' : 'App')
const pageDescription = computed(() => app.value?.description || app.value?.short_bio || 'Published FireUX App.')
const appHeroStyle = computed(() => ({ backgroundImage: app.value?.media.cover_url ? `url(${app.value.media.cover_url})` : undefined }))
const ignitionTo = computed(() => `/get-started?example=${encodeURIComponent(app.value?.slug || app.value?.id || routeId.value)}`)
const canonicalPath = computed(() => app.value?.detail_url || `/apps/${encodeURIComponent(routeId.value)}`)
const isIndexable = computed(() => Boolean(app.value && isDirectoryAppIndexable(app.value.id)))

useSeo({
  title: computed(() => app.value ? `${app.value.name} · FireUX App` : 'FireUX App'),
  description: pageDescription,
  path: canonicalPath,
  image: computed(() => app.value?.media.cover_url || app.value?.media.thumbnail_url || undefined),
  robots: computed(() => isIndexable.value ? 'index, follow' : 'noindex, nofollow'),
  jsonLdBuilder: (context) => {
    if (!isIndexable.value || !app.value) return null
    const items = []
    if (project.value) items.push({ name: project.value.name, url: context.absoluteUrl(`/projects/${project.value.id}`) })
    if (ecosystem.value) items.push({ name: ecosystem.value.name, url: context.absoluteUrl(ecosystem.value.detail_url) })
    return buildPublicPageJsonLd({ canonicalUrl: context.canonicalUrl, description: context.description, image: context.image, title: context.title, items })
  },
})
</script>

<style scoped src="./app-detail.css"></style>
