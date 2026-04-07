<template>
  <UDashboardPanel id="console-kitchen-training">
    <template #header>
      <LayoutsConsoleNavbar title="Training" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span> · Modules:
          <span class="font-medium">{{ trainingModules.length }}</span>
        </div>

        <UCard v-if="trainingModules.length">
          <div class="space-y-2">
            <div
              v-for="module in trainingModules"
              :key="module.id"
              class="rounded border border-default p-3"
            >
              <div class="font-medium">{{ module.title || module.id || 'Untitled module' }}</div>
              <div class="text-xs text-dimmed">
                {{ module.status || 'draft' }} · {{ module.minutes || 0 }} min
              </div>
              <div class="mt-1 text-xs text-dimmed">
                {{ module.description || 'No description' }}
              </div>
              <div v-if="module.tags.length" class="mt-2 flex flex-wrap gap-1">
                <UBadge
                  v-for="tag in module.tags"
                  :key="tag"
                  size="xs"
                  variant="soft"
                  color="neutral"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No training modules loaded"
          description="No training module data yet for this kitchen context."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActiveKitchen } from '../../../composables/fireux/app/kitchen-console/useActiveKitchen'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-training',
    label: 'Training',
    icon: 'i-lucide-graduation-cap',
    order: 8,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useActiveKitchen()
const mode = runtime.mode
const trainingModules = computed(() =>
  (runtime.data.value.trainingModules ?? []).map((module: any, index: number) => ({
    id: String(module?.id || '').trim() || `module-${index + 1}`,
    title: String(module?.title || '').trim(),
    description: String(module?.description || '').trim(),
    status: String(module?.status || '').trim(),
    minutes: Number(module?.minutes || 0),
    tags: Array.isArray(module?.tags)
      ? module.tags.map((tag: unknown) => String(tag || '').trim()).filter(Boolean)
      : [],
  }))
)
</script>
