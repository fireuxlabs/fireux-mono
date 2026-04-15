<template>
  <section class="console-surface">
    <div v-if="project" class="console-surface__grid console-surface__grid--2">
      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Focus</div>
            <p class="console-card-header__description">
              Runtime data for the selected project.
            </p>
          </div>
        </template>

        <div class="console-focus">
          <div class="console-focus__title">
            {{ projectTitle }}
          </div>

          <div class="console-metric">
            <div class="console-metric__value">
              {{ focusAppsValue }}
            </div>
            <div class="console-metric__label">Apps</div>
          </div>

          <p class="console-card-header__description">
            {{ focusSummary }}
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">All</div>
            <p class="console-card-header__description">
              Project-level context across the console collection.
            </p>
          </div>
        </template>

        <div class="console-focus">
          <div class="console-focus__title">
            All Projects
          </div>

          <div class="console-metric">
            <div class="console-metric__value">
              {{ allProjectsValue }}
            </div>
            <div class="console-metric__label">Projects</div>
          </div>

          <p class="console-card-header__description">
            {{ allSummary }}
          </p>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Summary</div>
          <p class="console-card-header__description">
            Live details for the currently selected project.
          </p>
        </div>
      </template>

      <div v-if="project" class="console-summary-grid">
        <div class="console-summary-field">
          Project ID:
          <span class="console-summary-value">{{ projectId }}</span>
        </div>
        <div v-if="projectName" class="console-summary-field">
          Name:
          <span class="console-summary-value">{{ projectName }}</span>
        </div>
        <div v-if="projectSlug" class="console-summary-field">
          Slug:
          <span class="console-summary-value">{{ projectSlug }}</span>
        </div>
        <div v-if="projectStatus" class="console-summary-field">
          Status:
          <span class="console-summary-value">{{ projectStatus }}</span>
        </div>
        <div v-if="ecosystemLabel" class="console-summary-field">
          Ecosystem:
          <span class="console-summary-value">{{ ecosystemLabel }}</span>
        </div>
        <div class="console-summary-field">
          Apps:
          <span class="console-summary-value">{{ focusAppsValue }}</span>
        </div>
        <div v-if="consoleEndpoint" class="console-summary-field console-summary-field--full">
          Console Endpoint:
          <span class="console-summary-value break-all">{{ consoleEndpoint }}</span>
        </div>
        <div v-if="projectDescription" class="console-summary-field console-summary-field--full">
          Description:
          <span class="console-summary-value">{{ projectDescription }}</span>
        </div>
      </div>

      <p v-else class="console-card-header__description">
        No live project is currently selected.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectConsole } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsole'
import { useRuntimeProjectData } from 'fireux-core/runtime/composables/fireux/app/project-console/useRuntimeProjectData'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'

const { projectState, project } = useProjectConsole()
const runtimeData = useRuntimeProjectData({
  id: projectState.id,
  project: projectState.project,
})
const { count: totalProjects } = useProjectCollection()
const selectedProject = computed(
  () => projectState.project.value as Record<string, unknown> | null
)

const normalizeString = (value: unknown): string => String(value || '').trim()

const projectId = computed(() => projectState.id.value)
const projectName = computed(() => normalizeString(selectedProject.value?.name))
const projectSlug = computed(() => normalizeString(selectedProject.value?.slug))
const projectStatus = computed(() => normalizeString(selectedProject.value?.status))
const projectDescription = computed(() => normalizeString(selectedProject.value?.description))
const consoleEndpoint = computed(() =>
  normalizeString(
    selectedProject.value?.console_endpoint_url || selectedProject.value?.source_url
  )
)

const projectTitle = computed(
  () => project.value?.title || projectName.value || projectSlug.value || projectId.value || 'Selected Project'
)
const focusAppsValue = computed(() => String(runtimeData.value.apps.length))
const allProjectsValue = computed(() => totalProjectsLabel.value)
const totalProjectsLabel = computed(() => String(totalProjects.value || 0))
const ecosystemLabel = computed(() => normalizeString(runtimeData.value.ecosystemId))
const focusSummary = computed(() => {
  if (!project.value) return 'No active project selected.'
  if (ecosystemLabel.value) {
    return `${focusAppsValue.value} app${focusAppsValue.value === '1' ? '' : 's'} linked through ${ecosystemLabel.value}.`
  }
  return `${focusAppsValue.value} app${focusAppsValue.value === '1' ? '' : 's'} currently resolved for this project.`
})
const allSummary = computed(
  () => `Total projects in scope: ${totalProjectsLabel.value}.`
)
</script>
