<template>
  <UDashboardPanel id="console-kitchen-haccp">
    <template #header>
      <LayoutsConsoleNavbar title="HACCP" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span> · Controls:
          <span class="font-medium">{{ haccpChecks.length }}</span>
        </div>

        <UCard v-if="haccpChecks.length">
          <div class="space-y-2">
            <div
              v-for="check in haccpChecks"
              :key="check.id"
              class="rounded border border-default p-3"
            >
              <div class="flex items-center gap-2">
                <div class="font-medium">{{ check.title || check.id || 'Untitled check' }}</div>
                <UBadge size="xs" variant="soft" color="neutral">{{ check.status || 'due' }}</UBadge>
              </div>
              <div class="text-xs text-dimmed">
                {{ check.type || 'check' }} · {{ check.frequency || 'unscheduled' }}
                <template v-if="check.lastRecorded"> · {{ check.lastRecorded }}</template>
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No HACCP items loaded"
          description="No compliance-control rows derived yet for this kitchen."
        />
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
    key: 'console-kitchen-haccp',
    label: 'HACCP',
    icon: 'i-lucide-shield-check',
    order: 9,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const haccpChecks = computed(() =>
  (runtime.data.value.haccpChecks ?? []).map((check: any, index: number) => ({
    id: String(check?.id || '').trim() || `check-${index + 1}`,
    title: String(check?.title || '').trim(),
    type: String(check?.type || '').trim(),
    frequency: String(check?.frequency || '').trim(),
    status: String(check?.status || '').trim(),
    lastRecorded: String(check?.last_recorded || '').trim(),
  }))
)
</script>
