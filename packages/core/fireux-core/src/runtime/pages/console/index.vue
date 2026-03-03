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

type Hub = {
  key: string
  path: string
  label: string
}

/**
 * Generic hub discovery:
 * - finds any route under /console/<hub>/...
 * - groups by <hub>
 * - prefers an explicit /console/<hub> route as the hub path if it exists,
 *   otherwise falls back to the first child route under that hub.
 */
const hubs = computed<Hub[]>(() => {
  const routes = router.getRoutes()

  const underConsole = routes
    .map((r) => String(r.path || ''))
    .filter((p) => p.startsWith('/console/') && p !== '/console')

  const byKey = new Map<string, string[]>()

  for (const path of underConsole) {
    const parts = path.split('/').filter(Boolean) // ["console", "<hub>", ...]
    if (parts[0] !== 'console') continue
    const hubKey = String(parts[1] || '').trim()
    if (!hubKey) continue

    const list = byKey.get(hubKey) || []
    list.push(path)
    byKey.set(hubKey, list)
  }

  const hasExact = (path: string) => routes.some((r) => String(r.path || '') === path)

  const result: Hub[] = []
  for (const [key, paths] of byKey.entries()) {
    const explicitHubPath = `/console/${key}`
    const hubPath = hasExact(explicitHubPath) ? explicitHubPath : paths.sort()[0]

    const label = key
      .split('-')
      .filter(Boolean)
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ')

    result.push({ key, path: hubPath, label })
  }

  return result.sort((a, b) => a.label.localeCompare(b.label))
})

const hubCount = computed(() => hubs.value.length)

/**
 * Auto-redirect if exactly one hub exists.
 */
watchEffect(() => {
  if (hubCount.value !== 1) return
  if (router.currentRoute.value.path !== '/console') return

  const target = hubs.value[0]?.path || ''
  if (target) router.replace(target)
})
</script>