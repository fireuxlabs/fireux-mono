<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader
      title="Dev · Projects"
      description="Project root model and current App relationship diagnostics."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div>
            appId:
            <span class="font-mono">{{ resolvedAppId || 'missing' }}</span>
          </div>
          <div>
            selectedId:
            <span class="font-mono">{{ selectedId || 'unset' }}</span>
          </div>
          <div>
            project count:
            <span class="font-mono">{{ projects.length }}</span>
          </div>
        </div>
      </UCard>

      <DevModel :title="'Projects · Model'" :model="projectModelRuntime" />

      <UCard>
        <template #header>
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Project storage inspector
            </p>
            <p class="text-xs text-muted">
              Inspect one root Project. The current App may reference it, but
              Project has no public or app-scoped representation.
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
            <UBadge variant="soft"> storage: root only </UBadge>
            <UBadge variant="soft"> child families: none defined </UBadge>
          </div>

          <UAlert
            color="neutral"
            variant="soft"
            title="Project remains a system-workspace special case"
            description="This inspector reads the FireUX control-plane Project only. Apps and Ecosystems point to it through project_id."
          />

<DevDebugPanel
  object-origin="fetched"
            launcher
            include-route
            title="Project storage (JSON)"
            context="dev projects · full storage picture"
            :objects="projectStorageJson"
  :derived="{}"
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
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useProjectWorkspaceSelection } from 'fireux-core/runtime/project/composables/workspace/core/useProjectWorkspaceSelection'
import { useProjectCollection } from 'fireux-core/runtime/project/composables/useProjectCollection'
import type { Project } from 'fireux-core/runtime/project/models/project.model'

definePageMeta({
  layout: 'dev',
  title: 'Dev · Projects',
  requiresAuth: true,
  roles: ['admin'],
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

const projectModelRuntime: Project = {
  id: '',
  status: 'inactive',
  name: '',
  description: '',
  image_url: '',
  created: { at: { seconds: 0, nanoseconds: 0 } },
  updated: { at: { seconds: 0, nanoseconds: 0 } },
}
const { appId } = useFireUXConfig()
const { selectedId } = useProjectWorkspaceSelection()
const resolvedAppId = computed(() => String(appId || '').trim())

const { projects } = useProjectCollection()

const rootProjectById = computed(() => {
  const map = new Map<string, Project>()
  for (const project of projects.value ?? []) {
    const id = String(project?.id || '').trim()
    if (!id) continue
    map.set(id, project as Project)
  }
  return map
})

const selectedProjectId = ref('')

const projectOptions = computed<{ label: string; value: string }[]>(() =>
  (projects.value ?? []).map((project) => {
    const id = String(project?.id || '').trim()
    const labelBase = String(project?.name || id).trim() || id
    return {
      label: `${labelBase} · root`,
      value: id,
    }
  })
)

watch(
  projectOptions,
  (options: { label: string; value: string }[]) => {
    if (!options.length) {
      selectedProjectId.value = ''
      return
    }

    const stillExists = options.some(
      (option) => option.value === selectedProjectId.value
    )
    if (!stillExists) {
      selectedProjectId.value = String(options[0]?.value || '')
    }
  },
  { immediate: true }
)

const selectedRootProject = computed(
  () => rootProjectById.value.get(selectedProjectId.value) ?? null
)

const projectStorageJson = computed(() => ({
  currentAppId: resolvedAppId.value || null,
  selectedId: selectedId.value || null,
  selectedProjectId: selectedProjectId.value || null,
  storage: 'root',
  paths: {
    rootProjectCollection: 'projects',
    selectedRootProjectDoc: selectedProjectId.value
      ? `projects/${selectedProjectId.value}`
      : null,
  },
  rootProject: selectedRootProject.value,
  childCollections: [],
}))
</script>
