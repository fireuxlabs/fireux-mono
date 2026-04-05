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

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Workspace Summary</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-4">
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

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Is Premium</div>
                <div class="text-sm font-medium">{{ isPremium ? 'true' : 'false' }}</div>
              </div>
            </div>
          </UCard>

          <UCard v-if="showDemoPremiumPreviewToggle">
            <div class="flex items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Preview Premium Real Summary</div>
                <p class="text-sm text-dimmed">
                  Show what premium real project collection insights can look like.
                </p>
              </div>

              <USwitch v-model="showPremiumPreview" />
            </div>
          </UCard>

          <UCard v-if="showPremiumCollectionSummary">
            <template #header>
              <div class="text-sm font-semibold">Premium Collection Summary</div>
            </template>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Total Projects</div>
              <div class="text-sm font-medium">{{ liveProjectCount }}</div>
            </div>
          </UCard>

          <UCard v-else-if="showDemoPremiumCollectionPreview">
            <template #header>
              <div class="text-sm font-semibold">Premium Real Preview</div>
            </template>

            <div class="space-y-3">
              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Total Projects</div>
                <div class="text-sm font-medium">{{ demoProjectCount }}</div>
              </div>

              <p class="text-sm text-dimmed">
                Preview only. Premium real mode can surface live collection summaries like this.
              </p>
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
import { computed, ref, watchEffect } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useRuntimeProjectSelection } from '~/composables/console/project/state'
import { useRuntimeProjectConsole } from '~/composables/console/project/useRuntimeProjectConsole'
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

const { scenarios } = useRuntimeProjectConsole()
const runtime = useRuntimeProject()
const projectSelection = useRuntimeProjectSelection()
const { currentUser: authUser } = useAuth()
const { isPremium } = useUser()
const { count: liveProjectCount } = useProjectCollection('projects')
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
    subtitle:
      projectSelection.mode.value === 'test'
        ? 'Test Project'
        : pill.subtitle,
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
const showPremiumPreview = ref(false)
const demoProjectCount = computed(() => scenarios.value.length)
const showPremiumCollectionSummary = computed(() =>
  projectSelection.mode.value === 'live' && isPremium.value
)
const showDemoPremiumPreviewToggle = computed(() =>
  projectSelection.mode.value === 'demo' && !isPremium.value
)
const showDemoPremiumCollectionPreview = computed(() =>
  projectSelection.mode.value === 'demo' &&
  (isPremium.value || showPremiumPreview.value)
)

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
