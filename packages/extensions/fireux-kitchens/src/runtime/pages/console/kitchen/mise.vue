<template>
  <UDashboardPanel id="console-kitchen-mise">
    <template #header>
      <LayoutsConsoleNavbar title="Mise en Place" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
        </div>

        <MiseCollectionManager
          v-if="miseTasks.length"
          :collection="miseTasks"
          title="Mise Tasks"
          description="Prep tasks for the selected runtime kitchen."
        />

        <p v-else class="text-sm text-dimmed">No mise tasks yet.</p>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-mise',
    label: 'Mise en place',
    icon: 'i-lucide-clipboard-check',
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const miseTasks = computed(() => runtime.data.value.miseTasks ?? [])
</script>
