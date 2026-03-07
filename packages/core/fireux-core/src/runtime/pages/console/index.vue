<!-- packages/core/fireux-core/src/runtime/pages/console/index.vue -->
<template>
  <UDashboardPanel id="console-home">
    <template #header>
      <LayoutsConsoleNavbar title="Console" />
    </template>

    <template #body>
      <section class="space-y-6">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ runtime.mode }}</span>
        </div>

        <UAlert
          v-if="hubCount === 0"
          color="neutral"
          variant="soft"
          title="No console hubs available"
          description="This build does not expose any /console/* routes."
        />

        <UCard v-else-if="hubCount > 1">
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Choose a console</div>
              <div class="text-xs text-dimmed">
                Multiple console hubs are available for this app.
              </div>
            </div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="hub in hubs"
              :key="hub.path"
              :to="hub.path"
              variant="soft"
              icon="i-lucide-terminal"
              block
            >
              {{ hub.label }}
            </UButton>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeApp } from '../../composables/fireux/app/runtime-app/useRuntimeApp'
import { discoverConsoleChildren } from '../../composables/fireux/app/routing/consoleRoutes'
import { toConsoleScopeLabel } from '../../composables/fireux/app/routing/consoleRoutes'
import { useConsoleAccess } from '../../composables/fireux/app/routing/useConsoleAccess'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-home',
    label: 'Console',
    icon: 'i-lucide-terminal',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeApp()
const router = useRouter()
const { visibleConsoleChildren } = useConsoleAccess({ targetPath: '/console' })

type Hub = {
  key: string
  path: string
  label: string
}

const hubs = computed<Hub[]>(() => {
  return discoverConsoleChildren(router.getRoutes()).map((entry) => ({
    key: entry.key,
    path: entry.path,
    label: toConsoleScopeLabel(entry.key) || 'Console',
  }))
})

const hubCount = computed(() => hubs.value.length)
const accessibleHubCount = computed(() => visibleConsoleChildren.value.length)

/**
 * Auto-redirect if exactly one hub exists.
 */
watchEffect(() => {
  if (accessibleHubCount.value !== 1) return
  if (router.currentRoute.value.path !== '/console') return

  const target = visibleConsoleChildren.value[0]?.path || ''
  if (target) router.replace(target)
})
</script>
