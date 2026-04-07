<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActiveProject } from '~/composables/console/project/useActiveProject'

const runtime = useActiveProject()
const project = computed(() => runtime.project.value as Record<string, unknown> | null)

const normalizeString = (value: unknown): string => String(value || '').trim()

const projectId = computed(() => runtime.id.value)
const projectName = computed(() => normalizeString(project.value?.name))
const projectSlug = computed(() => normalizeString(project.value?.slug))
const projectStatus = computed(() => normalizeString(project.value?.status))
const projectDescription = computed(() => normalizeString(project.value?.description))
const consoleEndpoint = computed(() =>
  normalizeString(project.value?.console_endpoint_url || project.value?.source_url)
)
</script>
