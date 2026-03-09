<template>
  <UDashboardPanel id="console-projects-home">
    <template #header>
      <LayoutsConsoleNavbar title="FireUX Project Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ runtime.mode }}</span>
          · Project: <span class="font-mono">{{ runtime.id }}</span>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Project runtime</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Project ID</div>
              <div class="text-sm font-mono break-all">{{ runtime.id }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Collection path</div>
              <div class="text-sm font-mono">{{ runtime.collectionPath }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Ecosystems</div>
              <div class="text-sm font-semibold">{{ stats.ecosystems }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Apps</div>
              <div class="text-sm font-semibold">{{ stats.apps }}</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Quick actions</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="entry in navItems"
              :key="entry.key"
              :to="entry.to"
              variant="soft"
              :icon="entry.icon"
              block
            >
              {{ entry.label }}
            </UButton>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeProjectConsole } from 'fireux-core/runtime/composables/fireux/app/runtime-project/useRuntimeProjectConsole'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects-overview',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, navItems, stats } = useRuntimeProjectConsole()
</script>
