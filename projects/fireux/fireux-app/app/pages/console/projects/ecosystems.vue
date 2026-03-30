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
          description="Select a project on /console/projects/overview before managing ecosystems."
          :actions="[
            {
              label: 'Go to projects',
              to: '/console/projects/overview',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <UCard>
          <template #header>
            <div class="text-sm font-semibold">Ecosystem management</div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="isWritableMode"
              :to="actions.createEcosystemTo"
              icon="i-lucide-plus"
              variant="soft"
              color="primary"
            >
              Create ecosystem
            </UButton>
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

          <EcosystemCollectionManager :collection="projectEcosystems" />
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeProjectConsole } from 'fireux-core/runtime/composables/fireux/app/runtime-project/useRuntimeProjectConsole'

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

const { runtime, projectEcosystems, actions } = useRuntimeProjectConsole()
const isWritableMode = computed(() => runtime.mode.value === 'live')
</script>
