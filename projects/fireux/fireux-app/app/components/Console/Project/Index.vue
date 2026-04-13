<template>
  <section class="space-y-6">
    <UAlert
      v-if="syncingProjects"
      color="primary"
      variant="soft"
      title="Syncing projects"
      description="Refreshing public project facades from each live console endpoint."
    />

    <UAlert
      v-else-if="syncState && syncState.failed"
      color="warning"
      variant="soft"
      title="Project sync completed with issues"
      :description="`${syncState.synced} synced · ${syncState.failed} failed`"
    />

    <UAlert
      v-else-if="syncState && syncState.synced"
      color="neutral"
      variant="soft"
      title="Projects are up to date"
      :description="`${syncState.synced} public project facades refreshed from live console endpoints.`"
    />

    <UAlert
      v-if="!projectsList.length"
      color="neutral"
      variant="soft"
      title="No live projects found"
      description="No live FireUX projects are currently available in this workspace."
    />

    <div v-else class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ project ? 'Selected Project' : 'Select a project' }}
          </div>

          <UButton
            v-if="project"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </div>

        <ProjectCardsPill
          v-if="project"
          v-bind="project"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a project below to load it into the console.
        </p>
      </div>

      <ProjectCollectionManager
        :collection="projectsList"
        title="Choose Project"
        description="Select the live project you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectProject"
      />

      <section class="w-full max-w-sm space-y-3">
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-default/60" />
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
          <div class="h-px flex-1 bg-default/60" />
        </div>

        <div class="space-y-2">
          <div class="text-sm font-medium text-highlighted">Try a project simulation</div>

          <USwitch
            v-model="showSimulations"
            unchecked-icon="i-lucide-x"
            checked-icon="i-lucide-check"
            label="Show project simulations"
          />
        </div>

        <div v-if="showSimulations" class="text-sm text-dimmed">
          Project Simulations
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import { useProjectConsole } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsole'
import { useProjectSelection } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectSelection'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import {
  readProjectPublicFacade,
  resolveFireuxConsoleEndpoint,
  type ProjectPublicFacade,
} from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/fireuxConsoleProjectFacade'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'

const { project, consoleState } = useProjectConsole({ publishHeader: true })
const { setRuntimeProject } = useProjectSelection()
const { projects } = useProjectCollection()
const { updateDocument } = useFirestoreUpdate()
const showSimulations = ref(false)
const clearSelection = consoleState.clearSelection
const syncingProjects = ref(false)
const canStartMountedSync = ref(false)
const hasTriggeredMountedSync = ref(false)
const syncState = ref<{
  synced: number
  failed: number
} | null>(null)
const projectsList = computed(() => projects.value ?? [])

const selectProject = (projectId: string) => {
  setRuntimeProject({ projectId })
}

async function syncProjectFacade(projectRow: ProjectSurface) {
  const projectId = String(projectRow.id || '').trim()
  if (!projectId) return false

  const endpointUrl = resolveFireuxConsoleEndpoint({
    console_endpoint_url: projectRow.console_endpoint_url,
    source_url: projectRow.source_url,
  })

  const response = await fetch(endpointUrl)
  if (!response.ok) {
    throw new Error(`Project endpoint returned ${response.status}`)
  }

  const payload = await response.json()
  const facade = readProjectPublicFacade(payload, endpointUrl)
  const patch: Partial<ProjectPublicFacade> = {
    name: facade.name,
    slug: facade.slug,
    description: facade.description,
    image_url: facade.image_url,
    status: facade.status,
    project_type: facade.project_type,
    source_url: facade.source_url,
    console_endpoint_url: facade.console_endpoint_url,
    app_id: facade.app_id,
    ecosystem_id: facade.ecosystem_id,
    firebase_project_id: facade.firebase_project_id,
  }

  await updateDocument('projects', projectId, patch)
  return true
}

async function syncAllProjects() {
  if (syncingProjects.value) return

  const rows = [...projectsList.value]
  if (!rows.length) return

  syncingProjects.value = true

  try {
    let synced = 0
    let failed = 0

    for (const row of rows) {
      try {
        const didSync = await syncProjectFacade(row)
        if (didSync) synced += 1
      } catch (error) {
        failed += 1
        if (import.meta.dev) {
          console.warn('[console/projects] project sync failed', {
            projectId: String(row?.id || '').trim(),
            error,
          })
        }
      }
    }

    syncState.value = {
      synced,
      failed,
    }
  } finally {
    syncingProjects.value = false
  }
}

onMounted(() => {
  canStartMountedSync.value = true
})

watch(
  projectsList,
  (rows) => {
    if (!canStartMountedSync.value) return
    if (hasTriggeredMountedSync.value) return
    if (!rows.length) return

    hasTriggeredMountedSync.value = true
    void syncAllProjects()
  },
  { immediate: true }
)
</script>
