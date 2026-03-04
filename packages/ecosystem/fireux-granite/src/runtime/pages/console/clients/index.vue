<template>
  <UDashboardPanel id="console-clients-home">
    <template #header>
      <LayoutsConsoleNavbar title="Clients" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UCard>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Client book</div>
            <div class="text-xs text-dimmed">
              Clients represent ownership relationships. Portfolios remain the operating runtime container.
            </div>
          </div>
        </UCard>

        <UAlert
          v-if="!clients.length"
          color="neutral"
          variant="soft"
          title="No clients found"
          description="No read-only client scenarios are available yet."
        />

        <div v-else class="space-y-3">
          <UCard v-for="client in clients" :key="client.id">
            <template #header>
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="text-sm font-semibold">{{ client.display_name }}</div>
                  <div class="text-xs text-dimmed">{{ client.subtitle }}</div>
                </div>

                <UBadge variant="soft">
                  {{ client.portfolios.length }} portfolio{{ client.portfolios.length === 1 ? '' : 's' }}
                </UBadge>
              </div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="portfolio in client.portfolios"
                :key="portfolio.id"
                class="rounded border border-default p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">{{ portfolio.name }}</div>
                    <div class="text-xs text-dimmed">
                      {{ portfolio.region_label || 'No region label' }}
                      · {{ portfolio.strategy_label || 'No strategy label' }}
                    </div>
                    <div class="text-xs text-dimmed">
                      Portfolio id: <span class="font-mono">{{ portfolio.id }}</span>
                    </div>
                  </div>

                  <UBadge :color="portfolio.mode === 'read-only' ? 'neutral' : 'primary'" variant="soft">
                    {{ portfolio.mode }}
                  </UBadge>
                </div>

                <div class="mt-3 flex flex-wrap gap-2">
                  <UButton
                    size="xs"
                    variant="soft"
                    icon="i-lucide-arrow-right"
                    @click="openPortfolioHub(portfolio.id, portfolio.mode)"
                  >
                    Open portfolio hub
                  </UButton>

                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-layout-dashboard"
                    to="/console/portfolio"
                  >
                    Runtime selector
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <DevJson
          v-if="isDev"
          title="Clients (JSON)"
          context="console/clients/index · read-only mapping"
          :data="clients"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '#imports'
import { useRuntimePortfolioSelection } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/state'
import { useGraniteReadOnlyClients } from '../../../composables/fireux/app/clients/useGraniteReadOnlyClients'

definePageMeta({
  layout: 'granite-console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-clients',
    label: 'Clients',
    icon: 'i-lucide-users',
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['granite-console'],
  },
  requiresAuth: true,
  name: 'ConsoleClientsIndexPage',
})

const isDev = import.meta.dev
const router = useRouter()
const { setRuntimePortfolio } = useRuntimePortfolioSelection()
const { clients: mapped } = useGraniteReadOnlyClients()

const clients = computed(() => mapped.value)

const openPortfolioHub = async (
  portfolioId: string,
  mode: 'read-only'
) => {
  const resolvedId = String(portfolioId || '').trim()
  if (!resolvedId) return
  setRuntimePortfolio({ portfolioId: resolvedId, mode })
  await router.push('/console/portfolio')
}
</script>
