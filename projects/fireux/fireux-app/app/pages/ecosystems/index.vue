<template>
  <EntityCollectionPage eyebrow="Discover" title="Ecosystems" description="Explore the product families that group FireUX Apps." icon="i-lucide-orbit">
    <template #actions>
      <div class="flex flex-wrap gap-2">
        <UButton to="/projects" color="neutral" variant="soft" icon="i-lucide-folder-kanban">Browse Projects</UButton>
        <UButton to="/apps" color="neutral" variant="ghost" icon="i-lucide-app-window">Browse Apps</UButton>
      </div>
    </template>
    <template #hero>
      <div class="ecosystem-summary">
        <span><UIcon name="i-lucide-network" aria-hidden="true" /></span>
        <dl><div><dt>Ecosystems</dt><dd>{{ ecosystems.length }}</dd></div><div><dt>Apps</dt><dd>{{ totalAppCount }}</dd></div></dl>
      </div>
    </template>

    <section class="ecosystem-collection">
      <CollectionHeader title="Active Ecosystems" description="Each Ecosystem groups Apps and belongs to one Project." />
      <CollectionState v-if="pending" title="Loading Ecosystems" description="Finding Ecosystems…" icon="i-lucide-loader-circle" loading />
      <CollectionState v-else-if="failed" title="Ecosystems unavailable" description="Ecosystems could not be loaded. Please try again." icon="i-lucide-triangle-alert" />
      <div v-else-if="ecosystems.length" class="ecosystem-grid">
        <article v-for="(ecosystem, index) in ecosystems" :key="ecosystem.id" class="ecosystem-card" :style="ecosystemTone(index)">
          <header>
            <UAvatar :src="ecosystem.image_url || undefined" :text="ecosystem.name || ecosystem.id" :alt="ecosystem.name || ecosystem.id" size="2xl" class="ecosystem-card__avatar" />
            <div><p>Ecosystem</p><h2><NuxtLink :to="ecosystem.detail_url">{{ ecosystem.name }}</NuxtLink></h2></div>
            <span class="ecosystem-card__count">{{ appCountLabel(ecosystem.app_count) }}</span>
          </header>
          <div class="ecosystem-card__body">
            <p class="ecosystem-card__description">{{ ecosystem.description }}</p>
            <NuxtLink v-if="projectFor(ecosystem.project_id)" :to="`/projects/${ecosystem.project_id}`" class="ecosystem-card__project">
              <UIcon name="i-lucide-folder-kanban" aria-hidden="true" />
              <span>Project</span>
              <strong>{{ projectFor(ecosystem.project_id)?.name }}</strong>
              <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
            </NuxtLink>
            <div class="ecosystem-card__apps">
              <NuxtLink v-for="app in appsFor(ecosystem.id)" :key="app.id" :to="app.detail_url">
                <UAvatar :src="app.media.logo_url || undefined" :text="app.name || app.id" :alt="app.name || app.id" size="xs" />
                <span>{{ app.name || app.id }}</span>
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
      <CollectionState v-else title="No Ecosystems yet" description="Active Ecosystems will appear here." icon="i-lucide-orbit" />
      <DevDebugPanel object-origin="fetched" launcher include-route title="Ecosystems (JSON)" context="Canonical Ecosystem directory projections with Project and App relationships derived separately" :objects="devJsonData" :derived="devDerived" :default-open="false" @opened="loadDevJson" @closed="unloadDevJson" />
    </section>
  </EntityCollectionPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { buildPublicPageJsonLd, useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'
import { usePublishedPlatformEcosystemDirectory } from '../../composables/usePlatformDirectory'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'

const ecosystemDirectory = usePublishedPlatformEcosystemDirectory()
const appDirectory = useApps('/api/platform/apps')
const projectCollection = useProjects()
const ecosystems = ecosystemDirectory.ecosystems
const pending = computed(() => ecosystemDirectory.pending.value || appDirectory.pending.value || projectCollection.pending.value)
const failed = computed(() => Boolean(ecosystemDirectory.error.value || appDirectory.error.value || projectCollection.error.value))
const totalAppCount = computed(() => ecosystems.value.reduce((total, item) => total + item.app_count, 0))
const appsFor = (ecosystemId: string) => appDirectory.apps.value.filter((app) => app.ecosystem_id === ecosystemId)
const projectFor = (projectId: string) => projectCollection.projects.value.find((project) => project.id === projectId) ?? null
const appCountLabel = (count: number) => `${count} ${count === 1 ? 'App' : 'Apps'}`
const tones = ['36 89% 55%', '197 74% 49%', '262 72% 62%', '145 63% 43%']
const ecosystemTone = (index: number) => ({ '--ecosystem-tone': tones[index % tones.length] })
const devDerived = computed(() => ({ relationships: Object.fromEntries(ecosystems.value.map((ecosystem) => [ecosystem.id, { project: projectFor(ecosystem.project_id), apps: appsFor(ecosystem.id) }])) }))
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(ecosystems)

definePageMeta({ tag: 'ecosystems', nav: { key: 'ecosystems', label: 'Ecosystems', icon: 'i-lucide-orbit', order: 50, desktop: true, mobile: true, layouts: ['default', 'landing'] }, title: 'Ecosystems', description: 'Browse published FireUX Ecosystems.', layout: 'default', name: 'EcosystemsIndexPage' })
useSeo({ title: 'FireUX Ecosystems', description: 'Browse published FireUX Ecosystems and their connected Apps.', path: '/ecosystems', image: '/img/app/cover.png', jsonLdBuilder: (context) => buildPublicPageJsonLd({ canonicalUrl: context.canonicalUrl, description: context.description, image: context.image, pageType: 'CollectionPage', title: context.title, items: ecosystems.value.map((ecosystem) => ({ name: ecosystem.name, url: context.absoluteUrl(ecosystem.detail_url) })) }) })
</script>

<style scoped src="./index.css"></style>
