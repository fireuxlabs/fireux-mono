<template>
  <UPage class="project-detail">
    <UPageBody>
      <CollectionDirectoryState
        v-if="pending"
        title="Loading Project"
        description="Finding this Project and its Apps…"
        icon="i-lucide-loader-circle"
        loading
      />

      <CollectionDirectoryState
        v-else-if="failed"
        title="Project unavailable"
        description="This Project could not be loaded. Please try again."
        icon="i-lucide-triangle-alert"
      />

      <CollectionDirectoryState
        v-else-if="missing"
        title="Project not found"
        description="No active Project matches this address."
        icon="i-lucide-folder-search"
      >
        <template #actions>
          <UButton to="/projects" icon="i-lucide-arrow-left" variant="soft">
            Browse Projects
          </UButton>
        </template>
      </CollectionDirectoryState>

      <template v-else-if="project">
        <header class="project-detail__hero">
          <div class="project-detail__back">
            <UButton
              to="/projects"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              size="sm"
            >
              All Projects
            </UButton>
          </div>

          <div class="project-detail__identity">
            <UAvatar
              :src="project.image_url || undefined"
              :text="project.name || project.id"
              :alt="project.name || project.id"
              icon="i-lucide-folder-kanban"
              size="3xl"
              class="project-detail__avatar"
            />
            <div>
              <p class="project-detail__eyebrow">FireUX Project</p>
              <h1>{{ project.name || project.id }}</h1>
              <p class="project-detail__description">
                {{ project.description }}
              </p>
            </div>
          </div>

          <dl class="project-detail__stats">
            <div>
              <dt>Connected Apps</dt>
              <dd>{{ projectApps.length }}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{{ project.status }}</dd>
            </div>
          </dl>
        </header>

        <section class="project-detail__section">
          <CollectionDirectoryHeader
            title="Apps in this Project"
            :description="appSectionDescription"
          />

          <div v-if="projectApps.length" class="project-detail__apps">
            <NuxtLink
              v-for="app in projectApps"
              :key="app.id"
              :to="app.detail_url"
              class="project-detail__app"
            >
              <div class="project-detail__app-visual">
                <img
                  v-if="app.media.cover_url"
                  :src="app.media.cover_url"
                  alt=""
                  loading="lazy"
                >
                <UIcon v-else name="i-lucide-app-window" aria-hidden="true" />
              </div>
              <div class="project-detail__app-copy">
                <UAvatar
                  :src="app.media.logo_url || undefined"
                  :text="app.name || app.id"
                  :alt="app.name || app.id"
                  size="md"
                />
                <div>
                  <h2>{{ app.name || app.id }}</h2>
                  <p>{{ app.description || app.short_bio || app.tagline || 'Published FireUX App.' }}</p>
                </div>
                <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
              </div>
            </NuxtLink>
          </div>

          <div v-else class="project-detail__empty">
            <UIcon name="i-lucide-app-window" aria-hidden="true" />
            <div>
              <h2>No Apps connected yet</h2>
              <p>Apps will appear here when their canonical project_id points to this Project.</p>
            </div>
          </div>
        </section>

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Project (JSON)"
          context="Canonical Project with connected Apps derived through App.project_id"
          :objects="[project]"
          :derived="{ apps: projectApps }"
          :default-open="false"
        />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectDirectory } from '../../composables/useProjectDirectory'
import { usePlatformAppDirectory } from '../../composables/usePlatformDirectory'

definePageMeta({
  layout: 'default',
  title: 'Project',
  description: 'View a FireUX Project and its connected Apps.',
  name: 'FireuxProjectDirectoryDetailPage',
})

const projectId = useRouteParam('id')
const projectDirectory = useProjectDirectory()
const appDirectory = usePlatformAppDirectory()
const project = computed(
  () => projectDirectory.projects.value.find((item) => item.id === projectId.value) ?? null
)
const projectApps = computed(() =>
  appDirectory.apps.value.filter((app) => app.project_id === projectId.value)
)
const pending = computed(
  () => projectDirectory.pending.value || appDirectory.pending.value
)
const failed = computed(
  () => Boolean(projectDirectory.error.value || appDirectory.error.value)
)
const missing = computed(() => !pending.value && !failed.value && !project.value)
const appSectionDescription = computed(() => {
  const count = projectApps.value.length
  if (!count) return 'No Apps currently declare this Project as their owner.'
  return `${count} ${count === 1 ? 'App is' : 'Apps are'} connected through canonical App.project_id.`
})

if (import.meta.server) {
  if (missing.value) setResponseStatus(404)
  else if (failed.value) setResponseStatus(503)
}

useSeo({
  title: computed(() => project.value ? `${project.value.name} · FireUX Project` : 'FireUX Project'),
  description: computed(() => project.value?.description || 'View a FireUX Project and its connected Apps.'),
  path: computed(() => `/projects/${encodeURIComponent(projectId.value)}`),
  image: computed(() => project.value?.image_url || undefined),
})
</script>

<style scoped src="./project-detail.css"></style>
