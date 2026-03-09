<template>
  <UDashboardPanel id="console-portfolio-properties">
    <template #header>
      <LayoutsConsoleNavbar title="Properties" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtimeId"
          color="warning"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /console/portfolio/overview before using console properties."
          :actions="[
            {
              label: 'Go to portfolios',
              to: '/console/portfolio/overview',
              icon: 'i-lucide-arrow-right'
            }
          ]"
        />

        <template v-else>
          <UCard>
            <div class="flex items-start gap-3">
              <div class="space-y-1">
                <div class="text-sm font-semibold">
                  {{ portfolioPill?.title || runtimeId }}
                </div>
                <div class="text-xs text-dimmed">
                  {{ portfolioPill?.subtitle || 'No region label' }} · mode {{ runtimeMode }}
                </div>
              </div>
            </div>
          </UCard>

          <PropertyCollectionManager
            :collection="properties"
            title="Property workspace"
            :description="workspaceDescription"
          />
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimePortfolio } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { usePropertyCollection } from '../../../composables/fireux/firestore/property/fetch/usePropertyCollection'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import PropertyCollectionManager from '../../../components/organisms/Property/Collection/Manager.vue'

definePageMeta({
  layout: 'granite-console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-properties',
    label: 'Properties',
    icon: 'i-lucide-building',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['granite-console'],
  },
  requiresAuth: true,
})

const runtimePortfolio = useRuntimePortfolio()
const { collection } = usePropertyCollection(runtimePortfolio)
const { pill } = usePortfolioInterface()

const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const properties = computed(() => collection.value)
const portfolioPill = computed(() => pill(runtimePortfolio.portfolio.value))
const workspaceDescription = computed(
  () => `Portfolio-scoped properties from portfolios/${runtimeId.value}/properties.`
)
</script>
