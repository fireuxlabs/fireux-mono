<template>
  <UPage>
    <UPageHeader
      title="Projects"
      description="Explore the Firebase Projects that host FireUX Ecosystems and Apps."
    >
      <template #links>
        <UButton to="/ecosystems" color="neutral" variant="soft">
          Browse Ecosystems
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <div
        v-if="pending"
        class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        aria-label="Loading Projects"
      >
        <UPageCard v-for="index in 6" :key="index" variant="subtle">
          <div class="space-y-4">
            <USkeleton class="size-14 rounded-2xl" />
            <USkeleton class="h-7 w-2/5" />
            <USkeleton class="h-16 w-full" />
          </div>
        </UPageCard>
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="Projects could not be loaded"
        description="Try loading your Project directory again."
        :actions="[
          {
            label: 'Try again',
            color: 'error',
            variant: 'soft',
            onClick: () => refresh(),
          },
        ]"
      />

      <div
        v-else-if="projects.length"
        class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        aria-label="Projects"
      >
        <UPageCard
          v-for="project in projects"
          :key="project.id"
          variant="subtle"
          class="h-full"
        >
          <div class="flex h-full flex-col gap-5">
            <div class="flex items-start justify-between gap-4">
              <div
                class="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-elevated text-muted"
              >
                <img
                  v-if="project.image_url"
                  :src="project.image_url"
                  :alt="`${project.name || project.id} logo`"
                  width="56"
                  height="56"
                  loading="lazy"
                  class="size-full object-contain"
                />
                <UIcon
                  v-else
                  name="i-lucide-briefcase-business"
                  class="size-7"
                  aria-hidden="true"
                />
              </div>
              <UBadge color="neutral" variant="soft">
                {{ statusLabel(project.status) }}
              </UBadge>
            </div>

            <div class="flex flex-1 flex-col gap-3">
              <h2 class="m-0 text-xl font-semibold text-highlighted">
                {{ project.name || project.id }}
              </h2>
              <p class="m-0 line-clamp-3 text-sm leading-6 text-muted">
                {{ project.description || 'No description yet.' }}
              </p>
              <p class="mt-auto pt-2 font-mono text-xs text-dimmed">
                {{ project.id }}
              </p>
            </div>
          </div>
        </UPageCard>
      </div>

      <MoleculesStateCard
        v-else
        entity="projects"
        state="empty"
        surface="bare"
        title="No Projects available"
        description="Active Projects will appear here when they are published by FireUX."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectDirectory } from '../../composables/useProjectDirectory'

const { projects, pending, error, refresh } = useProjectDirectory()
const statusLabel = (value: unknown) => {
  const status = String(value ?? '').trim()
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Draft'
}
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
  description:
    'Explore the Firebase Projects that host FireUX Ecosystems and Apps.',
  path: '/projects',
  image: '/img/app/cover.png',
})
</script>
