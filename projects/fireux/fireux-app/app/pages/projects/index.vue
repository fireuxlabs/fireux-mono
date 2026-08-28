<template>
  <CollectionPage
    eyebrow="Discover"
    title="Projects"
    description="Browse FireUX Projects and the Apps connected to each one."
    icon="i-lucide-folders"
  >
    <template #actions>
      <div class="flex flex-wrap gap-2">
        <UButton
          to="/ecosystems"
          color="neutral"
          variant="soft"
          icon="i-lucide-orbit"
        >
          Browse Ecosystems
        </UButton>
        <UButton
          to="/apps"
          color="neutral"
          variant="ghost"
          icon="i-lucide-app-window"
        >
          Browse Apps
        </UButton>
      </div>
    </template>

    <template #hero>
      <div class="project-summary" aria-label="Platform totals">
        <div class="project-summary__heading">
          <span class="project-summary__icon">
            <UIcon name="i-lucide-network" aria-hidden="true" />
          </span>
          <div>
            <p>Platform map</p>
            <span>Projects connect the Apps you can explore.</span>
          </div>
        </div>
        <dl class="project-summary__stats">
          <div>
            <dt>Projects</dt>
            <dd>{{ projects.length }}</dd>
          </div>
          <div>
            <dt>Apps</dt>
            <dd>{{ appDirectory.count.value }}</dd>
          </div>
        </dl>
      </div>
    </template>

    <section class="entity-collection project-collection">
      <CollectionHeader
        title="Active Projects"
        description="See the Apps connected to each Project."
      />

      <MoleculesStateCard
        surface="collection"
        v-if="pending"
        title="Loading Projects"
        description="Finding Projects…"
        icon="i-lucide-loader-circle"
        loading
      />

      <MoleculesStateCard
        surface="collection"
        v-else-if="error"
        state="error"
        title="Projects unavailable"
        description="Projects could not be loaded. Please try again."
        icon="i-lucide-triangle-alert"
      >
        <template #actions>
          <UButton
            label="Try again"
            color="neutral"
            variant="soft"
            icon="i-lucide-refresh-cw"
            @click="refresh"
          />
        </template>
      </MoleculesStateCard>

      <div
        v-else-if="projects.length"
        class="project-grid"
        aria-label="Projects"
      >
        <article
          v-for="(project, index) in projects"
          :key="project.id"
          class="project-card"
          :style="projectTone(index)"
        >
          <header class="project-card__header">
            <div class="project-card__identity">
              <UAvatar
                :src="project.image_url || undefined"
                :alt="project.name || project.id"
                :text="project.name || project.id"
                icon="i-lucide-folders"
                size="2xl"
                class="project-card__avatar"
              />
              <div class="min-w-0">
                <p class="project-card__eyebrow">Project</p>
                <h2>
                  <NuxtLink :to="`/projects/${encodeURIComponent(project.id)}`">
                    {{ project.name || project.id }}
                  </NuxtLink>
                </h2>
              </div>
            </div>
            <span class="project-card__count">
              {{ appCountLabel(project.id) }}
            </span>
          </header>

          <div class="project-card__body">
            <p class="project-card__description">
              {{ project.description || 'No description yet.' }}
            </p>

            <div class="project-card__apps">
              <div class="project-card__apps-heading">
                <span>Connected Apps</span>
                <UIcon name="i-lucide-arrow-down-right" aria-hidden="true" />
              </div>
              <div
                v-if="appsForProject(project.id).length"
                class="project-card__app-grid"
              >
                <NuxtLink
                  v-for="app in appsForProject(project.id)"
                  :key="app.id"
                  :to="`/apps/${encodeURIComponent(app.id)}`"
                  class="project-card__app"
                >
                  <UAvatar
                    :src="app.media?.logo_url || undefined"
                    :text="app.name || app.short_name || app.id"
                    :alt="app.name || app.short_name || app.id"
                    size="xs"
                  />
                  <span>{{ app.name || app.short_name || app.id }}</span>
                  <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
                </NuxtLink>
              </div>
              <p v-else class="project-card__empty">No Apps connected yet.</p>
            </div>
          </div>
        </article>
      </div>

      <MoleculesStateCard
        surface="collection"
        v-else
        icon="i-lucide-folders"
        title="No Projects yet"
        description="Active Projects will display here once they are available."
      />

      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Projects (JSON)"
        context="Project collection · source: server-read canonical Projects · canonical entity: Project"
        :objects="devJsonData"
        :derived="devDerived"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </section>
  </CollectionPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'

const projectCollection = useProjects()
const appDirectory = useApps('/api/platform/apps')
const { projects } = projectCollection
const pending = computed(
  () => projectCollection.pending.value || appDirectory.pending.value
)
const error = computed(
  () => projectCollection.error.value || appDirectory.error.value
)
const refresh = async () => {
  await Promise.all([projectCollection.refresh(), appDirectory.refresh()])
}
const appsByProject = computed(() => {
  const grouped = new Map<string, typeof appDirectory.apps.value>()
  for (const app of appDirectory.apps.value) {
    const current = grouped.get(app.project_id) ?? []
    current.push(app)
    grouped.set(app.project_id, current)
  }
  return grouped
})
const appsForProject = (projectId: string) =>
  appsByProject.value.get(projectId) ?? []
const appCountLabel = (projectId: string) => {
  const count = appsForProject(projectId).length
  return `${count} ${count === 1 ? 'App' : 'Apps'}`
}
const devDerived = computed(() => ({
  apps_by_project: Object.fromEntries(
    projects.value.map((project) => [
      project.id,
      appsForProject(project.id).map((app) => ({
        id: app.id,
        name: app.name,
        detail_url: `/apps/${encodeURIComponent(app.id)}`,
      })),
    ])
  ),
}))
const { devJsonData, loadDevJson, unloadDevJson } =
  useDevCollectionJson(projects)
const projectTones = ['36 89% 55%', '197 74% 49%', '262 72% 62%', '145 63% 43%']
const projectTone = (index: number) => ({
  '--project-tone': projectTones[index % projectTones.length],
})
definePageMeta({
  tag: 'projects',
  nav: {
    key: 'projects',
    label: 'Projects',
    icon: 'i-lucide-briefcase-business',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  title: 'Projects',
  description: 'Browse active FireUX Projects.',
  layout: 'default',
  name: 'FireuxProjectsIndexPage',
})

useSeo({
  title: 'FireUX Projects',
  description: 'Browse FireUX Projects and the Apps connected to each one.',
  path: '/projects',
  image: '/img/app/cover.png',
})
</script>

<style scoped src="./index.css"></style>
