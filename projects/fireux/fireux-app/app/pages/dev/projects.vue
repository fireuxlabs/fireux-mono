<template>
  <UPage>
    <UPageHeader
      title="Dev · Projects"
      description="Project model, root collection, and app-overlay diagnostics."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div>
            appId:
            <span class="font-mono">{{ resolvedAppId || 'missing' }}</span>
          </div>
          <div>
            runtimeProjectId:
            <span class="font-mono">{{ runtimeProjectId || 'unset' }}</span>
          </div>
          <div>
            runtimeProjectMode:
            <span class="font-mono">{{ runtimeProjectMode }}</span>
          </div>
          <div>
            project count:
            <span class="font-mono">{{ projects.length }}</span>
          </div>
        </div>
      </UCard>

      <DevModel
        :title="'Projects · Model'"
        :model="projectModelRuntime"
      />

      <ProjectCollectionManager
        :collection="projects"
        :description="'Root projects collection. Use the storage inspector below for root and overlay truth.'"
        :dev-json-title="'Root Projects (JSON)'"
        :dev-json-context="'dev projects · root collection'"
      />

      <UCard>
        <template #header>
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Project storage inspector
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Inspect one project across root and app overlay. Project does not yet define a child-family matrix like kitchen or portfolio.
            </p>
            <USelect
              v-model="selectedProjectId"
              :options="projectOptions"
              placeholder="Select a project"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <UBadge variant="soft">
              appId: {{ resolvedAppId || 'missing' }}
            </UBadge>
            <UBadge variant="soft">
              root doc: {{ selectedRootProject ? 'yes' : 'no' }}
            </UBadge>
            <UBadge variant="soft">
              app overlay: {{ selectedProjectApp ? 'yes' : 'no' }}
            </UBadge>
            <UBadge variant="soft">
              child families: none defined
            </UBadge>
          </div>

          <div
            v-if="!selectedProjectApp && selectedProjectId"
            class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900"
          >
            No app overlay found at
            <code>{{ overlayProjectCollectionPath }}/{{ selectedProjectId }}</code>.
          </div>

          <UAlert
            color="neutral"
            variant="soft"
            title="Project remains a system-console special case"
            description="This inspector focuses on the root project plus app overlay. Child families should only be added here when project canon defines them explicitly."
          />

          <DevJson
            title="Project storage (JSON)"
            context="dev projects · full storage picture"
            :data="projectStorageJson"
            :default-open="false"
            :hide-when-empty="false"
          />
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useProjectSelection } from '~/composables/console/project/useProjectSelection'
import { useDevStorageCollection } from 'fireux-core/runtime/composables/dev/useDevStorageCollection'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import type { ConsoleProject, Project } from 'fireux-core/runtime/models/system/project.model'
import { ProjectModel as ProjectModelRuntime } from 'fireux-core/runtime/models/system/project.model'

definePageMeta({
  layout: 'dev',
  title: 'Dev · Projects',
  nav: {
    key: 'dev-projects',
    label: 'Projects',
    icon: 'i-lucide-folders',
    desktop: true,
    group: 'core',
    order: 25,
    layouts: ['dev'],
  },
})

const projectModelRuntime = ProjectModelRuntime
const { appId } = useFireUXConfig()
const { runtimeProjectId, runtimeProjectMode } = useProjectSelection()
const resolvedAppId = computed(() => String(appId || '').trim())

const { projects } = useProjectCollection()
const overlayProjectCollectionPath = computed(() =>
  resolvedAppId.value ? `apps/${resolvedAppId.value}/projects` : ''
)
const projectAppsState = useDevStorageCollection<ConsoleProject>(overlayProjectCollectionPath)
const projectApps = computed(() => projectAppsState.items.value)

const rootProjectById = computed(() => {
  const map = new Map<string, Project>()
  for (const project of projects.value ?? []) {
    const id = String(project?.id || '').trim()
    if (!id) continue
    map.set(id, project as Project)
  }
  return map
})

const projectAppById = computed(() => {
  const map = new Map<string, ConsoleProject>()
  for (const project of projectApps.value) {
    const id = String(project?.id || '').trim()
    if (!id) continue
    map.set(id, project)
  }
  return map
})

const selectedProjectId = ref('')

const projectOptions = computed(() =>
  (projects.value ?? []).map((project) => {
    const id = String(project?.id || '').trim()
    const labelBase = String(project?.name || project?.slug || id).trim() || id
    const overlayStatus = projectAppById.value.has(id) ? 'console' : 'root only'
    return {
      label: `${labelBase} · ${overlayStatus}`,
      value: id,
    }
  })
)

watch(
  projectOptions,
  (options) => {
    if (!options.length) {
      selectedProjectId.value = ''
      return
    }

    const stillExists = options.some((option) => option.value === selectedProjectId.value)
    if (!stillExists) {
      selectedProjectId.value = String(options[0]?.value || '')
    }
  },
  { immediate: true }
)

const selectedRootProject = computed(() => rootProjectById.value.get(selectedProjectId.value) ?? null)
const selectedProjectApp = computed(() => projectAppById.value.get(selectedProjectId.value) ?? null)

const projectStorageJson = computed(() => ({
  appId: resolvedAppId.value || null,
  runtimeProjectId: runtimeProjectId.value || null,
  runtimeProjectMode: runtimeProjectMode.value,
  selectedProjectId: selectedProjectId.value || null,
  paths: {
    rootProjectCollection: 'projects',
    overlayProjectCollection: overlayProjectCollectionPath.value || null,
    selectedRootProjectDoc: selectedProjectId.value ? `projects/${selectedProjectId.value}` : null,
    selectedOverlayProjectDoc:
      selectedProjectId.value && overlayProjectCollectionPath.value
        ? `${overlayProjectCollectionPath.value}/${selectedProjectId.value}`
        : null,
  },
  rootProject: selectedRootProject.value,
  appProject: selectedProjectApp.value,
  overlayMissing: !selectedProjectApp.value,
  childCollections: [],
}))
</script>
