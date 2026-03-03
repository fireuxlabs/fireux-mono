<template>
  <UDashboardPanel id="console-app-home">
    <template #header>
      <LayoutsConsoleNavbar title="FireUX App Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ runtime.mode }}</span>
        </div>

        <UCard>
          <div class="space-y-2">
            <div class="text-sm font-medium">
              App Runtime
            </div>

            <div class="text-xs text-dimmed">
              This console manages the current app.
            </div>

            <div class="text-xs text-dimmed">
              Placeholder — features coming soon.
            </div>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeApp } from 'fireux-core/runtime/composables/fireux/app/runtime-app/useRuntimeApp'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-app-home',
    label: 'App',
    icon: 'i-lucide-layout-grid',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeApp()
</script>