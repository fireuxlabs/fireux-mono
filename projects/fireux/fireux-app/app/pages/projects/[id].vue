<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody space-y-6">
      <UAlert
        v-if="pending"
        color="neutral"
        variant="soft"
        title="Loading project"
        description="Fetching the selected project."
      />

      <UAlert
        v-else-if="!project"
        color="warning"
        variant="soft"
        title="Project not found"
        description="This project could not be found in the current runtime."
      />

      <template v-else>
        <UCard>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
            <UAvatar
              :src="projectCard?.imageUrl || undefined"
              :alt="pageTitle"
              size="3xl"
            />

            <div class="min-w-0 space-y-3">
              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">
                  Project
                </div>
                <h2 class="text-2xl font-semibold text-highlighted">
                  {{ pageTitle }}
                </h2>
                <p v-if="project.description" class="max-w-3xl text-sm text-toned">
                  {{ project.description }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="badge in projectCard?.badges || []"
                  :key="badge"
                  color="neutral"
                  variant="soft"
                >
                  {{ badge }}
                </UBadge>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton
                  v-if="project.source_url"
                  :to="project.source_url"
                  target="_blank"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-globe"
                >
                  Open site
                </UButton>

                <UButton
                  v-if="project.console_endpoint_url"
                  :to="project.console_endpoint_url"
                  target="_blank"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-terminal-square"
                >
                  Console endpoint
                </UButton>
              </div>
            </div>
          </div>
        </UCard>

        <div class="grid gap-4 lg:grid-cols-2">
          <UCard>
            <template #header>
              <div class="space-y-1">
                <div class="text-sm font-semibold text-highlighted">Identity</div>
                <p class="text-sm text-toned">
                  Core ids and ownership for this project.
                </p>
              </div>
            </template>

            <dl class="space-y-3 text-sm">
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">Id</dt>
                <dd class="font-mono text-default">{{ project.id }}</dd>
              </div>
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">Slug</dt>
                <dd class="font-mono text-default">{{ project.slug || '—' }}</dd>
              </div>
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">App</dt>
                <dd class="font-mono text-default">{{ project.app_id || '—' }}</dd>
              </div>
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">Ecosystem</dt>
                <dd class="font-mono text-default">{{ project.ecosystem_id || '—' }}</dd>
              </div>
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">Owner</dt>
                <dd class="font-mono text-default">{{ project.owner_user_id || '—' }}</dd>
              </div>
            </dl>
          </UCard>

          <UCard>
            <template #header>
              <div class="space-y-1">
                <div class="text-sm font-semibold text-highlighted">Runtime</div>
                <p class="text-sm text-toned">
                  Endpoint and Firebase information for this project.
                </p>
              </div>
            </template>

            <dl class="space-y-3 text-sm">
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">Type</dt>
                <dd class="text-default">{{ project.project_type || '—' }}</dd>
              </div>
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">Status</dt>
                <dd class="text-default">{{ project.status || '—' }}</dd>
              </div>
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">Firebase project</dt>
                <dd class="font-mono text-default">{{ project.firebase_project_id || '—' }}</dd>
              </div>
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">Source URL</dt>
                <dd class="break-all font-mono text-default">{{ project.source_url || '—' }}</dd>
              </div>
              <div class="grid gap-1">
                <dt class="text-xs uppercase tracking-[0.16em] text-toned">Console endpoint</dt>
                <dd class="break-all font-mono text-default">
                  {{ project.console_endpoint_url || '—' }}
                </dd>
              </div>
            </dl>
          </UCard>
        </div>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import {
  useProjectInterface,
  type ProjectSurface,
} from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'

definePageMeta({
  layout: 'default',
  name: 'ProjectDetailPage',
})

const route = useRoute()
const { appName } = useFireUXConfig()
const { projects, pending } = useProjectCollection()
const { profile } = useProjectInterface()

const routeId = computed(() => String(route.params.id || '').trim())

const project = computed<ProjectSurface | null>(() => {
  const key = routeId.value
  if (!key) return null

  return (
    projects.value.find((entry) => {
      const id = String(entry?.id || '').trim()
      const slug = String(entry?.slug || '').trim()
      return id === key || slug === key
    }) ?? null
  )
})

const projectCard = computed(() => profile(project.value))
const pageTitle = computed(
  () =>
    projectCard.value?.title ||
    String(project.value?.name || project.value?.slug || routeId.value || 'Project').trim()
)
const pageDescription = computed(() => {
  if (project.value?.description) return String(project.value.description).trim()
  if (projectCard.value?.meta) return projectCard.value.meta
  return 'Project details for the current runtime.'
})

useHead(() => ({
  title: `${appName} | ${pageTitle.value}`,
}))

useSeoMeta({
  title: computed(() => `${pageTitle.value} · FireUX`),
  description: pageDescription,
})
</script>
