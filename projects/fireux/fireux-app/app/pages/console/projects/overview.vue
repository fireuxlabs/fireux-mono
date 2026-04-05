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
          <div class="flex flex-wrap items-center gap-3">
            <ProjectCardsPill
              v-if="activeProjectPill"
              v-bind="activeProjectPill"
              :link="false"
              :show-badges="false"
            />
            <UBadge color="neutral" variant="soft" size="lg">
              {{ modeLabel }} Mode
            </UBadge>
          </div>

          <ConsoleProjectOverviewDemo v-if="projectSelection.mode.value === 'demo'" />
          <ConsoleProjectOverviewReal v-else-if="projectSelection.mode.value === 'live'" />
          <ConsoleProjectOverviewTest v-else />

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Project Areas</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton to="/console/projects/apps" color="neutral" variant="soft" icon="i-lucide-app-window">
                Apps
              </UButton>
              <UButton
                to="/console/projects/ecosystem"
                color="neutral"
                variant="soft"
                icon="i-lucide-network"
              >
                Ecosystem
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
import { useState } from '#imports'
import { computed, watchEffect } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
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
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestProjectSuffix = (value: unknown): string =>
  normalizeString(value).replace(/\s+test project$/i, '').trim()

const runtime = useRuntimeProject()
const projectSelection = useRuntimeProjectSelection()
const { currentUser: authUser } = useAuth()
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
    imageUrl: normalizeString(imageUrl) || pill.imageUrl,
    title:
      projectSelection.mode.value === 'test'
        ? normalizeString(authUser.value?.displayName) ||
          stripTestProjectSuffix(target?.name) ||
          'Your'
        : pill.title,
    subtitle: projectSelection.mode.value === 'test' ? 'Test Project' : pill.subtitle,
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

const consoleHeader = useState<{ component: string; props: Record<string, unknown> } | null>(
  'console-header-pill',
  () => null
)

watchEffect(() => {
  consoleHeader.value = activeProjectPill.value
    ? {
        component: 'ProjectCardsPill',
        props: {
          ...activeProjectPill.value,
          link: false,
          showBadges: false,
        },
      }
    : null
})
</script>
