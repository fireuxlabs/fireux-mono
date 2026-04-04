<template>
  <UDashboardPanel id="console-projects-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Project Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
          color="neutral"
          variant="soft"
          title="No project selected"
          description="Select a project on /console/projects before opening the project overview."
          :actions="[
            {
              label: 'Go to projects',
              to: '/console/projects',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <ProjectCardsPill
            v-if="activeProjectPill"
            v-bind="activeProjectPill"
            :link="false"
            :show-badges="false"
          />

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Workspace Summary</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Mode</div>
                <div class="text-sm font-medium">{{ modeLabel }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Source</div>
                <div class="text-sm font-medium">{{ sourceLabel }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Project Id</div>
                <div class="font-mono text-sm">{{ runtime.id }}</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Project Areas</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton to="/console/projects/apps" color="neutral" variant="soft" icon="i-lucide-app-window">
                Apps
              </UButton>
              <UButton
                to="/console/projects/ecosystems"
                color="neutral"
                variant="soft"
                icon="i-lucide-network"
              >
                Ecosystems
              </UButton>
              <UButton to="/console/projects" color="neutral" variant="ghost" icon="i-lucide-refresh-cw">
                Switch project
              </UButton>
            </div>
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleHeaderPill } from 'fireux-core/runtime/composables/fireux/app/routing/useConsoleHeaderPill'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useRuntimeProjectSelection } from '~/composables/console/project/state'
import { useRuntimeProject } from '~/composables/console/project/useRuntimeProject'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const normalizeString = (value: unknown): string => String(value || '').trim()
const runtime = useRuntimeProject()
const projectSelection = useRuntimeProjectSelection()
const { interface: toProjectCard } = useProjectInterface()

type ProjectPill = NonNullable<ReturnType<typeof toProjectCard>>

const buildProjectPill = (
  target?: Project | null,
  imageUrl?: unknown,
  id?: unknown
): ProjectPill | null => {
  const pill = toProjectCard({
    ...(target ?? {}),
    id: normalizeString(id) || normalizeString(target?.id),
  } as Project)

  if (!pill) return null

  return {
    ...pill,
    imageUrl: pill.imageUrl || normalizeString(imageUrl),
  }
}

const activeProjectPill = computed(() =>
  buildProjectPill(
    runtime.project.value as Project | null,
    runtime.scenario.value?.image_url,
    runtime.id.value
  )
)

const modeLabel = computed(() => {
  if (projectSelection.mode.value === 'live') return 'Real'
  if (projectSelection.mode.value === 'test') return 'Test'
  return 'Demo'
})

const sourceLabel = computed(() => {
  if (projectSelection.mode.value === 'live') return 'Firestore production data'
  if (projectSelection.mode.value === 'test') return 'Firestore test data'
  return 'Curated demo scenario'
})

useConsoleHeaderPill('console-header-pill-project', 'ProjectCardsPill', activeProjectPill)
</script>
