<template>
  <UDashboardPanel id="console-project-runtime">
    <template #header>
      <LayoutsConsoleNavbar title="FireUX Project Runtime" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Current project runtime context</div>
              <div class="text-xs text-dimmed">
                FireUX console is bound to one project runtime and manages ecosystem/app collections.
              </div>
            </div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Project ID</div>
              <div class="text-sm font-mono break-all">{{ runtime.id }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Mode</div>
              <div class="text-sm font-semibold">{{ runtime.mode }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Collection path</div>
              <div class="text-sm font-mono">{{ runtime.collectionPath }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Ready</div>
              <div class="text-sm font-semibold">{{ runtime.isReady ? 'yes' : 'no' }}</div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-if="!runtime.hasDoc"
          color="neutral"
          variant="soft"
          title="No projects document found"
          :description="`Optional document missing at ${runtime.collectionPath}/${runtime.id}. Console remains operational from project runtime + collections.`"
        />

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Project collections</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Ecosystems</div>
              <div class="text-xl font-semibold">{{ ecosystemCount }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Apps</div>
              <div class="text-xl font-semibold">{{ appCount }}</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Project surfaces</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <UButton to="/console" variant="soft" icon="i-lucide-terminal" block>
              Console home
            </UButton>
            <UButton to="/ecosystems" variant="soft" icon="i-lucide-orbit" block>
              Ecosystems
            </UButton>
            <UButton to="/apps" variant="soft" icon="i-lucide-app-window" block>
              Apps
            </UButton>
            <UButton to="/projects" variant="soft" icon="i-lucide-folder-open" block>
              Projects
            </UButton>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeProject } from 'fireux-core/runtime/composables/fireux/app/runtime-project/useRuntimeProject'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useEcosystemCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/ecosystem/fetch/useEcosystemCollection'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-project-runtime',
    label: 'Project',
    icon: 'i-lucide-folder-open',
    order: 15,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeProject()
const { count: ecosystemCount } = useEcosystemCollection()
const { count: appCount } = useAppCollection()
</script>
