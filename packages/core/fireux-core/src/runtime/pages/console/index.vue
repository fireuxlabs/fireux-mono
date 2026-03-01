<template>
  <UDashboardPanel id="console-home">
    <template #header>
      <LayoutsConsoleNavbar title="Runtime Console" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Kitchen Console</div>
              <div class="text-xs text-dimmed">
                Runtime operation scope for kitchen workflows.
              </div>
            </div>
          </template>

          <div v-if="!hasKitchenConsole" class="text-sm text-dimmed">
            Kitchen module is not available in this app.
          </div>

          <div v-else class="space-y-3">
            <template v-if="runtimeKitchenId">
              <div class="text-sm">
                Active kitchen:
                <span class="font-mono">{{ runtimeKitchenId }}</span>
                <span class="text-dimmed">({{ runtimeKitchenMode }})</span>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton
                  to="/console/kitchen"
                  size="sm"
                  color="neutral"
                  icon="i-lucide-chef-hat"
                >
                  Open kitchen console
                </UButton>
                <UButton
                  v-if="hasKitchenIngredients"
                  to="/console/kitchen/ingredients"
                  size="sm"
                  variant="soft"
                  color="neutral"
                  icon="i-lucide-carrot"
                >
                  Ingredients
                </UButton>
                <UButton
                  v-if="hasKitchenMenu"
                  to="/console/kitchen/menu"
                  size="sm"
                  variant="soft"
                  color="neutral"
                  icon="i-lucide-notebook-pen"
                >
                  Menu
                </UButton>
              </div>
            </template>

            <template v-else>
              <UAlert
                color="warning"
                variant="soft"
                title="No active kitchen selected"
                description="Select a kitchen in Dashboard before opening kitchen runtime operations."
              />

              <UButton
                to="/dashboard/kitchens"
                size="sm"
                color="neutral"
                icon="i-lucide-arrow-right"
              >
                Select a kitchen
              </UButton>
            </template>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Portfolio Console</div>
              <div class="text-xs text-dimmed">
                Runtime operation scope for Granite portfolios.
              </div>
            </div>
          </template>

          <div v-if="!hasPortfolioConsole" class="text-sm text-dimmed">
            Portfolio module is not available in this app.
          </div>

          <div v-else class="space-y-3">
            <template v-if="runtimePortfolioId">
              <div class="text-sm">
                Active portfolio:
                <span class="font-mono">{{ runtimePortfolioId }}</span>
                <span class="text-dimmed">({{ runtimePortfolioMode }})</span>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton
                  to="/console/portfolio"
                  size="sm"
                  color="neutral"
                  icon="i-lucide-building-2"
                >
                  Open portfolio console
                </UButton>
                <UButton
                  v-if="hasPortfolioProperties"
                  to="/console/portfolio/properties"
                  size="sm"
                  variant="soft"
                  color="neutral"
                  icon="i-lucide-building"
                >
                  Properties
                </UButton>
              </div>
            </template>

            <template v-else>
              <UAlert
                color="warning"
                variant="soft"
                title="No active portfolio selected"
                description="Select a portfolio in Dashboard before opening portfolio runtime operations."
              />

              <UButton
                to="/dashboard/portfolios"
                size="sm"
                color="neutral"
                icon="i-lucide-arrow-right"
              >
                Select a portfolio
              </UButton>
            </template>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, useCookie } from '#imports'
import { useRouter } from 'vue-router'

type RuntimeKitchenSelectionState = {
  kitchenId?: string
  mode?: string
}

type RuntimePortfolioSelectionState = {
  portfolioId?: string
  mode?: string
}

definePageMeta({
  nav: {
    key: 'console-home',
    label: 'Console Home',
    icon: 'i-lucide-terminal',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  layout: 'console',
})

const router = useRouter()
const kitchenCookie = useCookie<RuntimeKitchenSelectionState>('fireux_runtime_kitchen')
const portfolioCookie = useCookie<RuntimePortfolioSelectionState>(
  'fireux_runtime_portfolio'
)

const hasRoutePath = (path: string) =>
  router.getRoutes().some((route) => route.path === path)

const runtimeKitchenId = computed(() =>
  String(kitchenCookie.value?.kitchenId || '').trim()
)
const runtimeKitchenMode = computed(
  () => String(kitchenCookie.value?.mode || 'live').trim() || 'live'
)
const runtimePortfolioId = computed(() =>
  String(portfolioCookie.value?.portfolioId || '').trim()
)
const runtimePortfolioMode = computed(
  () => String(portfolioCookie.value?.mode || 'live').trim() || 'live'
)

const hasKitchenConsole = computed(() => hasRoutePath('/console/kitchen'))
const hasKitchenIngredients = computed(() =>
  hasRoutePath('/console/kitchen/ingredients')
)
const hasKitchenMenu = computed(() => hasRoutePath('/console/kitchen/menu'))
const hasPortfolioConsole = computed(() => hasRoutePath('/console/portfolio'))
const hasPortfolioProperties = computed(() =>
  hasRoutePath('/console/portfolio/properties')
)
</script>
