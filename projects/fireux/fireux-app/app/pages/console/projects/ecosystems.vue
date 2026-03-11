<template>
  <UDashboardPanel id="console-projects-ecosystems">
    <template #header>
      <LayoutsConsoleNavbar title="Project Ecosystems" />
    </template>

    <template #body>
      <section class="space-y-6">
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

        <EcosystemCollectionManager :collection="collection" :pending="false" />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
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

const { runtime, ecosystemRows, actions } = useRuntimeProjectConsole()
if (!runtime.id.value) {
  await navigateTo('/console/projects/create', { replace: true })
}
const isWritableMode = computed(() => runtime.mode.value === 'live')

const initials = (value: string) =>
  String(value || '')
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

const collection = computed(() =>
  ecosystemRows.value.map((row) => ({
    key: row.id,
    name: row.name,
    text: initials(row.name || row.id),
    src: '',
    href: '',
    apps: row.appCount,
    team: row.team,
  }))
)
</script>
