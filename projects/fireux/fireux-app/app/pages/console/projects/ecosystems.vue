<template>
  <UDashboardPanel id="console-projects-ecosystems">
    <template #header>
      <LayoutsConsoleNavbar title="Project Ecosystems" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
          color="neutral"
          variant="soft"
          title="No project selected"
          description="Select a project on /console/projects before viewing ecosystems."
          :actions="[
            {
              label: 'Go to projects',
              to: '/console/projects',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Ecosystems in this demo project</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton
                to="/ecosystems"
                icon="i-lucide-orbit"
                variant="ghost"
                color="neutral"
              >
                Open public index
              </UButton>
            </div>
          </UCard>

          <UAlert
            v-if="!ecosystemRows.length"
            color="neutral"
            variant="soft"
            title="No ecosystems found"
          />

          <UCard
            v-for="ecosystem in ecosystemRows"
            :key="ecosystem.id"
          >
            <template #header>
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="text-sm font-semibold">{{ ecosystem.name }}</div>
                  <div class="text-xs font-mono text-dimmed">{{ ecosystem.id }}</div>
                </div>
                <UBadge variant="soft">{{ ecosystem.appCount }} apps</UBadge>
              </div>
            </template>

            <div class="text-sm text-dimmed">
              Team:
              <span class="font-medium text-default">{{ ecosystem.team || 'unassigned' }}</span>
            </div>
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeProject } from '~/composables/console/project/useRuntimeProject'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-projects-ecosystems',
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeProject()

const normalizeString = (value: unknown): string => String(value || '').trim()

const ecosystemRows = computed(() =>
  (runtime.scenario.value?.ecosystems ?? []).map((entry) => {
    const id = normalizeString((entry as any).id)
    const name = normalizeString((entry as any).name) || id || 'Untitled ecosystem'
    const team = normalizeString((entry as any).team)
    const rawApps = Array.isArray((entry as any).apps) ? (entry as any).apps : []

    return {
      id,
      name,
      team,
      appCount: rawApps.length,
    }
  })
)
</script>
