<template>
  <article class="app-detail">
    <!-- 01 Identity -->
    <header class="app-detail__hero">
      <div
        v-if="app.media?.cover_url"
        class="app-detail__cover"
        :style="appHeroStyle"
        aria-hidden="true"
      />
      <div class="app-detail__shade" aria-hidden="true" />
      <div class="app-detail__topline">
        <UButton
          to="/apps"
          color="neutral"
          variant="soft"
          icon="i-lucide-arrow-left"
          size="sm"
          >All Apps</UButton
        >
        <span class="app-detail__role">{{ roleLabel }}</span>
      </div>
      <div class="app-detail__identity">
        <UAvatar
          :src="app.media?.logo_url || app.media?.thumbnail_url || undefined"
          :text="app.name || app.id"
          :alt="app.name || app.id"
          size="3xl"
          class="app-detail__avatar"
        />
        <div>
          <p class="app-detail__eyebrow">FireUX App</p>
          <h1>{{ app.name || app.id }}</h1>
          <p v-if="app.tagline" class="app-detail__tagline">
            {{ app.tagline }}
          </p>
          <p class="app-detail__description">{{ pageDescription }}</p>
          <div class="app-detail__actions">
            <UButton icon="i-lucide-rocket" :to="ignitionTo"
              >Start an App like this</UButton
            >
            <UButton
              v-if="app.role === 'global' && ecosystem?.website_url"
              :to="ecosystem.website_url"
              target="_blank"
              color="neutral"
              variant="soft"
              icon="i-lucide-external-link"
              >Visit App</UButton
            >
          </div>
        </div>
      </div>
    </header>

    <!-- 02 Relationships -->
    <section class="app-detail__section">
      <CollectionHeader
        title="Where this App belongs"
        description="Canonical relationships from App.project_id and App.ecosystem_id."
      />
      <div class="app-detail__relationships">
        <NuxtLink
          v-if="project"
          :to="`/projects/${encodeURIComponent(project.id)}`"
          class="app-detail__relationship"
        >
          <span class="app-detail__relationship-icon"
            ><UIcon name="i-lucide-folder-kanban" aria-hidden="true"
          /></span>
          <div>
            <p>Project</p>
            <h2>{{ project.name || project.id }}</h2>
            <span>{{ project.description }}</span>
          </div>
          <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
        </NuxtLink>
        <NuxtLink
          v-if="ecosystem"
          :to="ecosystem.detail_url"
          class="app-detail__relationship"
        >
          <span class="app-detail__relationship-icon"
            ><UIcon name="i-lucide-orbit" aria-hidden="true"
          /></span>
          <div>
            <p>Ecosystem</p>
            <h2>{{ ecosystem.name }}</h2>
            <span>{{ ecosystem.description }}</span>
          </div>
          <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
        </NuxtLink>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import type { EcosystemDirectoryEntry } from 'fireux-core/runtime/models/utils/directory'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePlatformDirectory } from '../../../composables/usePlatformDirectory'
import { isDirectoryAppIndexable } from '../../../utils/directorySearchPolicy'

const props = defineProps<{ app: App }>()
const { projects } = useProjects()
const { data: directoryData } = usePlatformDirectory()
const project = computed<Project | null>(
  () =>
    projects.value.find((entry) => entry.id === props.app.project_id) ?? null
)
const ecosystem = computed<EcosystemDirectoryEntry | null>(() => {
  const id = props.app.ecosystem_id
  return id
    ? (directoryData.value?.ecosystems.find(
        (entry: EcosystemDirectoryEntry) => entry.id === id
      ) ?? null)
    : null
})

const roleLabel = computed(() =>
  props.app.role === 'global'
    ? 'Main App'
    : props.app.role === 'tenant'
      ? 'Tenant App'
      : props.app.role === 'standalone'
        ? 'Standalone App'
        : 'App'
)
const pageDescription = computed(
  () => props.app.description || props.app.short_bio || 'Published FireUX App.'
)
const appHeroStyle = computed(() => ({
  backgroundImage: props.app.media?.cover_url
    ? `url(${props.app.media.cover_url})`
    : undefined,
}))
const ignitionTo = computed(
  () => `/get-started?example=${encodeURIComponent(props.app.id)}`
)
const isIndexable = computed(() => isDirectoryAppIndexable(props.app.id))

useSeo({
  title: computed(() => `${props.app.name} · FireUX App`),
  description: pageDescription,
  path: computed(() => `/apps/${encodeURIComponent(props.app.id)}`),
  image: computed(
    () => props.app.media?.cover_url || props.app.media?.thumbnail_url
  ),
  robots: computed(() =>
    isIndexable.value ? 'index, follow' : 'noindex, nofollow'
  ),
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
      items: [
        ...(project.value
          ? [
              {
                name: project.value.name,
                url: context.absoluteUrl(`/projects/${project.value.id}`),
              },
            ]
          : []),
        ...(ecosystem.value
          ? [
              {
                name: ecosystem.value.name,
                url: context.absoluteUrl(ecosystem.value.detail_url),
              },
            ]
          : []),
      ],
    }),
})
</script>

<style scoped src="../../../pages/apps/app-detail.css"></style>
