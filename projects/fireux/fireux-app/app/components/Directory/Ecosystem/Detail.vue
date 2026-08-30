<template>
  <article class="ecosystem-detail">
    <!-- 01 Identity -->
    <header class="ecosystem-detail__hero">
      <div class="ecosystem-detail__topline">
        <UButton
          to="/ecosystems"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          size="sm"
          >All Ecosystems</UButton
        >
        <UButton
          v-if="ecosystem.website_url"
          :to="ecosystem.website_url"
          target="_blank"
          color="neutral"
          variant="soft"
          icon="i-lucide-external-link"
          size="sm"
          >Visit Ecosystem</UButton
        >
      </div>
      <div class="ecosystem-detail__identity">
        <UAvatar
          :src="ecosystem.image_url || undefined"
          :text="ecosystem.name || ecosystem.id"
          :alt="ecosystem.name || ecosystem.id"
          size="3xl"
          class="ecosystem-detail__avatar"
        />
        <div>
          <p>Ecosystem</p>
          <h1>{{ ecosystem.name }}</h1>
          <span>{{ ecosystem.description }}</span>
          <UButton
            v-if="explorePath"
            :to="explorePath"
            color="neutral"
            variant="soft"
            trailing-icon="i-lucide-arrow-right"
            class="mt-5"
            >Explore {{ ecosystem.name }}</UButton
          >
        </div>
      </div>
      <dl>
        <div>
          <dt>Connected Apps</dt>
          <dd>{{ apps.length }}</dd>
        </div>
        <div>
          <dt>Project</dt>
          <dd>{{ project?.name || ecosystem.project_id }}</dd>
        </div>
      </dl>
    </header>

    <!-- 02 Apps -->
    <section class="ecosystem-detail__section">
      <CollectionHeader
        :title="`Apps in ${ecosystem.name}`"
        :description="`${apps.length} ${apps.length === 1 ? 'App is' : 'Apps are'} connected through App.ecosystem_id.`"
      />
      <div class="ecosystem-detail__apps">
        <NuxtLink
          v-for="app in apps"
          :key="app.id"
          :to="`/apps/${app.id}`"
          class="ecosystem-detail__app"
        >
          <div class="ecosystem-detail__visual">
            <img
              v-if="app.media?.cover_url"
              :src="app.media.cover_url"
              alt=""
              loading="lazy"
            /><UIcon v-else name="i-lucide-app-window" aria-hidden="true" />
          </div>
          <div class="ecosystem-detail__app-copy">
            <UAvatar
              :src="app.media?.logo_url || undefined"
              :text="app.name || app.id"
              :alt="app.name || app.id"
              size="md"
            />
            <div>
              <h2>{{ app.name }}</h2>
              <p>
                {{
                  app.description ||
                  app.short_bio ||
                  app.tagline ||
                  'FireUX App.'
                }}
              </p>
            </div>
            <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- 03 Project -->
    <section v-if="project" class="ecosystem-detail__section">
      <CollectionHeader
        title="Owning Project"
        description="The Project connected through Ecosystem.project_id."
      />
      <NuxtLink
        :to="`/projects/${project.id}`"
        class="ecosystem-detail__project"
        ><UIcon name="i-lucide-folder-kanban" aria-hidden="true" />
        <div>
          <p>Project</p>
          <h2>{{ project.name }}</h2>
          <span>{{ project.description }}</span>
        </div>
        <UIcon name="i-lucide-arrow-up-right" aria-hidden="true"
      /></NuxtLink>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import type { EcosystemDirectoryEntry } from 'fireux-core/runtime/models/utils/directory'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const props = defineProps<{ ecosystem: EcosystemDirectoryEntry }>()
const { apps: allApps } = useApps('/api/platform/apps')
const { projects } = useProjects()
const apps = computed<App[]>(() =>
  allApps.value.filter((app) => app.ecosystem_id === props.ecosystem.id)
)
const project = computed<Project | null>(
  () =>
    projects.value.find((item) => item.id === props.ecosystem.project_id) ??
    null
)
const explorePath = computed(() =>
  ['misebox', 'werkbox'].includes(props.ecosystem.id)
    ? `/ecosystems/${props.ecosystem.id}/explore`
    : ''
)

useSeo({
  title: computed(() => `${props.ecosystem.name} · FireUX Ecosystem`),
  description: computed(
    () => props.ecosystem.description || 'View a FireUX Ecosystem.'
  ),
  path: computed(() => props.ecosystem.detail_url),
  image: computed(() => props.ecosystem.image_url || '/img/app/cover.png'),
  robots: 'index, follow',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: apps.value.map((app) => ({
        name: app.name,
        url: context.absoluteUrl(`/apps/${app.id}`),
      })),
    }),
})
</script>

<style scoped src="../../../pages/ecosystems/ecosystem-detail.css"></style>
