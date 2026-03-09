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

        <UCard v-else>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Opening console</div>
              <div class="text-xs text-dimmed">
                Redirecting to the default console scope for this app.
              </div>
            </div>
          </template>
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
import { useConsoleAccess } from '../../composables/fireux/app/routing/useConsoleAccess'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

const runtime = useRuntimeApp()
const router = useRouter()
const { visibleConsoleChildren } = useConsoleAccess({ targetPath: '/console' })

const hubCount = computed(() => discoverConsoleChildren(router.getRoutes()).length)
const accessibleHubCount = computed(() => visibleConsoleChildren.value.length)

/**
 * Root /console is entry-only. Redirect to the first accessible scope.
 */
watchEffect(() => {
  if (accessibleHubCount.value < 1) return
  if (router.currentRoute.value.path !== '/console') return

  const target = visibleConsoleChildren.value[0]?.path || ''
  if (target) router.replace(target)
})
</script>
