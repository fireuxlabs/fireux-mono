<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ runtime.mode }}</span>
          · Portfolio: <span class="font-mono">{{ runtime.id }}</span>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Portfolio runtime</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="item in overview"
              :key="item.key"
              class="rounded border border-default p-3"
            >
              <div class="text-xs text-dimmed">{{ item.label }}</div>
              <div class="text-lg font-semibold">{{ item.count }}</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Quick actions</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="link in surfaceLinks"
              :key="link.key"
              :to="link.to"
              variant="soft"
              :icon="link.icon"
              block
            >
              {{ link.label }}
            </UButton>
          </div>
        </UCard>

        <DevJson
          v-if="isDev"
          title="Portfolio Runtime (JSON)"
          context="console/portfolio/overview · runtime snapshot"
          :data="runtimeSnapshot"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import { useRuntimePortfolioConsole } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-overview',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, surfaceLinks, overview, stats } = useRuntimePortfolioConsole()
if (!runtime.id.value) {
  await navigateTo('/console/portfolio/create', { replace: true })
}

const isDev = import.meta.dev

const runtimeSnapshot = computed(() => ({
  id: runtime.id.value,
  mode: runtime.mode.value,
  isReadOnly: runtime.isReadOnly.value,
  documentCollectionPath: runtime.documentCollectionPath.value,
  collectionPath: runtime.collectionPath.value,
  pending: runtime.pending.value,
  isLoading: runtime.isLoading.value,
  isReady: runtime.isReady.value,
  doc: runtime.doc.value,
  data: runtime.data.value,
  stats: stats.value,
}))
</script>
