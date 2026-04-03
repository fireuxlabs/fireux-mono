<template>
  <UDashboardPanel id="console-projects-apps">
    <template #header>
      <LayoutsConsoleNavbar title="Project Apps" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
          color="neutral"
          variant="soft"
          title="No project selected"
          description="Select a project on /console/projects before viewing apps."
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
              <div class="text-sm font-semibold">Apps in this demo project</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton
                to="/apps"
                icon="i-lucide-app-window"
                variant="ghost"
                color="neutral"
              >
                Open public index
              </UButton>
            </div>
          </UCard>

          <UAlert
            v-if="!appRows.length"
            color="neutral"
            variant="soft"
            title="No apps found"
          />

          <UCard
            v-for="app in appRows"
            :key="app.id"
          >
            <template #header>
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="text-sm font-semibold">{{ app.name }}</div>
                  <div class="text-xs font-mono text-dimmed">{{ app.id }}</div>
                </div>
                <UBadge variant="soft">{{ app.status }}</UBadge>
              </div>
            </template>

            <div class="text-sm text-dimmed">
              Ecosystem:
              <span class="font-medium text-default">{{ app.ecosystemId || 'unassigned' }}</span>
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
    key: 'console-projects-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeProject()

const normalizeString = (value: unknown): string => String(value || '').trim()

const appRows = computed(() =>
  (runtime.scenario.value?.apps ?? []).map((entry) => {
    const id = normalizeString((entry as any).id)
    const name =
      normalizeString((entry as any).app_name) ||
      normalizeString((entry as any).app_short_name) ||
      id ||
      'Untitled app'
    const ecosystemId =
      normalizeString((entry as any).ecosystem_id) ||
      normalizeString((entry as any).ecosystem)
    const status =
      normalizeString((entry as any).status) ||
      normalizeString((entry as any).moderation_state) ||
      'active'

    return {
      id,
      name,
      ecosystemId,
      status,
    }
  })
)
</script>
