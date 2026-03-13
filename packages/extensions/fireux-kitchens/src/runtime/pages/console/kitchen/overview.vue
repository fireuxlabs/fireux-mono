<template>
  <UDashboardPanel id="console-kitchen-home">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
        </div>

        <UCard>
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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

        <DevJson
          v-if="isDev"
          title="Kitchen Runtime (JSON)"
          context="console/kitchen/overview · runtime snapshot"
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
import { useRuntimeKitchenConsole } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchenConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-overview',
    label: 'Overview',
    icon: 'i-lucide-chef-hat',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, overview } = useRuntimeKitchenConsole()
const mode = runtime.mode
const isDev = import.meta.dev

if (!runtime.id.value) {
  await navigateTo('/console/kitchen/create', { replace: true })
}

const runtimeSnapshot = computed(() => {
  const data = runtime.data.value
  return {
    id: runtime.id.value,
    mode: runtime.mode.value,
    isReadOnly: runtime.isReadOnly.value,
    collectionPath: runtime.collectionPath.value,
    pending: runtime.pending.value,
    isLoading: runtime.isLoading.value,
    isReady: runtime.isReady.value,
    doc: runtime.doc.value,
    data,
  }
})
</script>
