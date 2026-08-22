<template>
  <UPage class="ecosystem-detail"><UPageBody>
    <CollectionDirectoryState v-if="pending" title="Loading Ecosystem" description="Finding this Ecosystem and its relationships…" icon="i-lucide-loader-circle" loading />
    <CollectionDirectoryState v-else-if="failed" title="Ecosystem unavailable" description="This Ecosystem could not be loaded." icon="i-lucide-triangle-alert" />
    <CollectionDirectoryState v-else-if="missing" title="Ecosystem not found" description="No active Ecosystem matches this address." icon="i-lucide-orbit"><template #actions><UButton to="/ecosystems" icon="i-lucide-arrow-left" variant="soft">Browse Ecosystems</UButton></template></CollectionDirectoryState>
    <template v-else-if="ecosystem">
      <header class="ecosystem-detail__hero">
        <div class="ecosystem-detail__topline"><UButton to="/ecosystems" color="neutral" variant="ghost" icon="i-lucide-arrow-left" size="sm">All Ecosystems</UButton><UButton v-if="ecosystem.website_url" :to="ecosystem.website_url" target="_blank" color="neutral" variant="soft" icon="i-lucide-external-link" size="sm">Visit Ecosystem</UButton></div>
        <div class="ecosystem-detail__identity">
          <UAvatar :src="ecosystem.image_url || undefined" :text="ecosystem.name || ecosystem.id" :alt="ecosystem.name || ecosystem.id" size="3xl" class="ecosystem-detail__avatar" />
          <div><p>Ecosystem</p><h1>{{ ecosystem.name }}</h1><span>{{ ecosystem.description }}</span><UButton v-if="explorePath" :to="explorePath" color="neutral" variant="soft" trailing-icon="i-lucide-arrow-right" class="mt-5">Explore {{ ecosystem.name }}</UButton></div>
        </div>
        <dl><div><dt>Connected Apps</dt><dd>{{ ecosystemApps.length }}</dd></div><div><dt>Project</dt><dd>{{ project?.name || ecosystem.project_id }}</dd></div></dl>
      </header>

      <section class="ecosystem-detail__section">
        <CollectionDirectoryHeader :title="`Apps in ${ecosystem.name}`" :description="`${ecosystemApps.length} ${ecosystemApps.length === 1 ? 'App is' : 'Apps are'} connected through canonical App.ecosystem_id.`" />
        <div v-if="ecosystemApps.length" class="ecosystem-detail__apps">
          <NuxtLink v-for="app in ecosystemApps" :key="app.id" :to="`/apps/${app.id}`" class="ecosystem-detail__app">
            <div class="ecosystem-detail__visual"><img v-if="app.media?.cover_url" :src="app.media.cover_url" alt="" loading="lazy"><UIcon v-else name="i-lucide-app-window" aria-hidden="true" /></div>
            <div class="ecosystem-detail__app-copy"><UAvatar :src="app.media?.logo_url || undefined" :text="app.name || app.id" :alt="app.name || app.id" size="md" /><div><h2>{{ app.name }}</h2><p>{{ app.description || app.short_bio || app.tagline || 'Published FireUX App.' }}</p></div><UIcon name="i-lucide-arrow-up-right" aria-hidden="true" /></div>
          </NuxtLink>
        </div>
      </section>

      <section v-if="project" class="ecosystem-detail__section">
        <CollectionDirectoryHeader title="Owning Project" description="The Project connected through canonical Ecosystem.project_id." />
        <NuxtLink :to="`/projects/${project.id}`" class="ecosystem-detail__project"><UIcon name="i-lucide-folder-kanban" aria-hidden="true" /><div><p>Project</p><h2>{{ project.name }}</h2><span>{{ project.description }}</span></div><UIcon name="i-lucide-arrow-up-right" aria-hidden="true" /></NuxtLink>
      </section>

      <DevDebugPanel object-origin="fetched" launcher include-route title="Ecosystem (JSON)" context="Canonical Ecosystem directory projection with Project and Apps derived separately" :objects="[ecosystem]" :derived="{ project, apps: ecosystemApps }" :default-open="false" />
    </template>
  </UPageBody></UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { buildPublicPageJsonLd, useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type { PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'

definePageMeta({ layout: 'default', title: 'Ecosystem', description: 'View a FireUX Ecosystem and its connected Apps.', name: 'FireuxEcosystemDetailPage' })
const routeId = useRouteParam('id')
const { data, pending: directoryPending, error } = await useAsyncData<PlatformDirectoryResponse>('fireux-default-directory', () => $fetch('/api/directory'), { server: true, lazy: false })
const projectCollection = useProjects()
const { apps, pending: appsPending, error: appsError } = useApps('/api/platform/apps')
const ecosystem = computed(() => data.value?.ecosystems.find((entry) => entry.id === routeId.value || entry.detail_url === `/ecosystems/${routeId.value}`) ?? null)
const ecosystemApps = computed(() => ecosystem.value ? apps.value.filter((app) => app.ecosystem_id === ecosystem.value?.id) : [])
const project = computed(() => projectCollection.projects.value.find((item) => item.id === ecosystem.value?.project_id) ?? null)
const pending = computed(() => directoryPending.value || projectCollection.pending.value || appsPending.value)
const failed = computed(() => Boolean(error.value || projectCollection.error.value || appsError.value))
const missing = computed(() => !pending.value && !failed.value && !ecosystem.value)
const explorePath = computed(() => ['misebox', 'werkbox'].includes(routeId.value) ? `/ecosystems/${routeId.value}/explore` : '')
if (import.meta.server) { if (missing.value) setResponseStatus(404); else if (failed.value) setResponseStatus(503) }
const canonicalPath = computed(() => ecosystem.value?.detail_url || `/ecosystems/${routeId.value}`)
useSeo({ title: computed(() => ecosystem.value ? `${ecosystem.value.name} · FireUX Ecosystem` : 'FireUX Ecosystem'), description: computed(() => ecosystem.value?.description || 'View a FireUX Ecosystem and its connected Apps.'), path: canonicalPath, image: computed(() => ecosystem.value?.image_url || '/img/app/cover.png'), robots: computed(() => ecosystem.value ? 'index, follow' : 'noindex, nofollow'), jsonLdBuilder: (context) => ecosystem.value ? buildPublicPageJsonLd({ canonicalUrl: context.canonicalUrl, description: context.description, image: context.image, pageType: 'CollectionPage', title: context.title, items: ecosystemApps.value.map((app) => ({ name: app.name, url: context.absoluteUrl(`/apps/${app.id}`) })) }) : null })
</script>

<style scoped src="./ecosystem-detail.css"></style>
