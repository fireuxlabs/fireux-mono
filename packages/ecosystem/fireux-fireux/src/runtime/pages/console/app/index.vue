<template>
  <UDashboardPanel id="console-app-home">
    <template #header>
      <LayoutsConsoleNavbar title="App Console" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Current app runtime context</div>
              <div class="text-xs text-dimmed">
                FireUX app runtime is bound to the active app configuration.
              </div>
            </div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">App ID</div>
              <div class="text-sm font-mono break-all">{{ runtimeAppId }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">App name</div>
              <div class="text-sm font-semibold">{{ runtimeAppName }}</div>
              <div class="text-xs text-dimmed">{{ runtimeAppShortName }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Ecosystem</div>
              <div class="text-sm font-semibold">{{ runtimeEcosystem }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Role</div>
              <div class="text-sm font-semibold">{{ runtimeRoleLabel }}</div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-if="isLoading"
          color="neutral"
          variant="soft"
          title="Resolving app runtime"
          description="Loading current app document."
        />

        <template v-else-if="!hasAppDoc">
          <UAlert
            color="warning"
            variant="soft"
            title="Runtime app document not found"
            description="No fallback is applied. This console only operates on the configured app runtime."
          />

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="hasDashboardDeveloper"
              to="/dashboard/developer"
              size="sm"
              color="neutral"
              icon="i-lucide-wrench"
            >
              Open developer dashboard
            </UButton>
            <UButton
              v-if="hasDashboardAdmin"
              to="/dashboard/admin"
              size="sm"
              variant="soft"
              color="neutral"
              icon="i-lucide-shield-check"
            >
              Open admin dashboard
            </UButton>
          </div>
        </template>

        <template v-else>
          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Operational snapshot</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Admins</div>
                <div class="text-xl font-semibold">{{ appAdminCount }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Users</div>
                <div class="text-xl font-semibold">{{ appUserCount }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Enabled modules</div>
                <div class="text-xl font-semibold">{{ enabledModuleCount }}</div>
              </div>
            </div>
          </UCard>
        </template>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">App tools</div>
          </template>

          <div v-if="hasAnyToolRoute" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-if="hasDevApps"
              to="/dev/apps"
              variant="soft"
              icon="i-lucide-layout-grid"
              block
            >
              App registry
            </UButton>
            <UButton
              v-if="hasDashboardAdmin"
              to="/dashboard/admin"
              variant="soft"
              icon="i-lucide-shield-check"
              block
            >
              Admin
            </UButton>
            <UButton
              v-if="hasDashboardDeveloper"
              to="/dashboard/developer"
              variant="soft"
              icon="i-lucide-wrench"
              block
            >
              Developer
            </UButton>
          </div>

          <div v-else class="text-sm text-dimmed">
            No dedicated app tooling routes are available in this build.
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeApp } from 'fireux-core/runtime/composables/fireux/app/runtime-app/useRuntimeApp'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { ecosystems: ['fireux'] },
    key: 'console-runtime-app',
    label: 'App',
    icon: 'i-lucide-app-window',
    order: 15,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtimeApp = useRuntimeApp()
const router = useRouter()

const hasRoutePath = (path: string) =>
  router.getRoutes().some((route) => route.path === path)

const runtimeAppId = runtimeApp.id
const runtimeAppName = runtimeApp.name
const runtimeAppShortName = runtimeApp.shortName
const runtimeEcosystem = runtimeApp.ecosystem
const runtimeRoleLabel = computed(() =>
  runtimeApp.role.value === 'tenant' ? 'Tenant' : 'Global'
)

const hasAppDoc = computed(() => Boolean(runtimeApp.app.value))
const appAdminCount = computed(() => {
  const raw = Array.isArray(runtimeApp.app.value?.admin_ids)
    ? runtimeApp.app.value?.admin_ids
    : []
  return raw
    .map((entry) => String(entry || '').trim())
    .filter(Boolean).length
})
const appUserCount = computed(() => Number(runtimeApp.app.value?.derived?.user_count ?? 0))
const enabledModuleCount = computed(() => runtimeApp.modules.value.length)
const isLoading = runtimeApp.isLoading

const hasDevApps = computed(() => hasRoutePath('/dev/apps'))
const hasDashboardAdmin = computed(() => hasRoutePath('/dashboard/admin'))
const hasDashboardDeveloper = computed(() =>
  hasRoutePath('/dashboard/developer')
)
const hasAnyToolRoute = computed(
  () =>
    hasDevApps.value ||
    hasDashboardAdmin.value ||
    hasDashboardDeveloper.value
)
</script>
