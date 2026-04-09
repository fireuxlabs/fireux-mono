<template>
  <section class="space-y-6">
    <div v-if="project" class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Focus</div>
            <p class="text-sm text-dimmed">
              Metrics for the selected project.
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <div class="text-sm font-medium text-highlighted">
            {{ projectTitle }}
          </div>

          <div class="space-y-1">
            <div class="text-3xl font-semibold text-default">
              {{ focusUsersValue }}
            </div>
            <div class="text-sm text-dimmed">Users</div>
          </div>

          <p class="text-sm text-dimmed">
            User totals for the selected project are not wired yet.
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">All</div>
            <p class="text-sm text-dimmed">
              Metrics across every project in the collection.
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <div class="text-sm font-medium text-highlighted">
            All Projects
          </div>

          <div class="space-y-1">
            <div class="text-3xl font-semibold text-default">
              {{ allUsersValue }}
            </div>
            <div class="text-sm text-dimmed">Users</div>
          </div>

          <p class="text-sm text-dimmed">
            Total projects in scope: {{ totalProjectsLabel }}.
          </p>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <div class="text-sm font-semibold">Project Summary</div>
          <p class="text-sm text-dimmed">
            Live details for the currently selected project.
          </p>
        </div>
      </template>

      <div v-if="project" class="grid gap-3 text-sm text-dimmed sm:grid-cols-2">
        <div>
          Project ID:
          <span class="font-medium text-default">{{ projectId }}</span>
        </div>
        <div v-if="projectName">
          Name:
          <span class="font-medium text-default">{{ projectName }}</span>
        </div>
        <div v-if="projectSlug">
          Slug:
          <span class="font-medium text-default">{{ projectSlug }}</span>
        </div>
        <div v-if="projectStatus">
          Status:
          <span class="font-medium text-default">{{ projectStatus }}</span>
        </div>
        <div v-if="consoleEndpoint" class="sm:col-span-2">
          Console Endpoint:
          <span class="font-medium text-default break-all">{{ consoleEndpoint }}</span>
        </div>
        <div v-if="projectDescription" class="sm:col-span-2">
          Description:
          <span class="font-medium text-default">{{ projectDescription }}</span>
        </div>
      </div>

      <p v-else class="text-sm text-dimmed">
        No live project is currently selected.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActiveProject } from 'fireux-core/runtime/composables/fireux/app/project-console/useActiveProject'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'

const projectState = useActiveProject()
const { count: totalProjects } = useProjectCollection('projects')
const project = computed(() => projectState.project.value as Record<string, unknown> | null)

const normalizeString = (value: unknown): string => String(value || '').trim()

const projectId = computed(() => projectState.id.value)
const projectName = computed(() => normalizeString(project.value?.name))
const projectSlug = computed(() => normalizeString(project.value?.slug))
const projectStatus = computed(() => normalizeString(project.value?.status))
const projectDescription = computed(() => normalizeString(project.value?.description))
const consoleEndpoint = computed(() =>
  normalizeString(project.value?.console_endpoint_url || project.value?.source_url)
)

const projectTitle = computed(() => projectName.value || projectSlug.value || projectId.value || 'Selected Project')
const focusUsersValue = computed(() => '—')
const allUsersValue = computed(() => '—')
const totalProjectsLabel = computed(() => String(totalProjects.value || 0))
</script>
