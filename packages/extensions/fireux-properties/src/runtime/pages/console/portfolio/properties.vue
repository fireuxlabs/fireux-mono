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
          description="Select a portfolio on /dashboard/portfolios before using console properties."
          :actions="[
            {
              label: 'Go to portfolios',
              to: '/dashboard/portfolios',
              icon: 'i-lucide-arrow-right'
            }
          ]"
        />

        <template v-else>
          <UCard>
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="text-sm font-semibold">
                  {{ portfolioPill?.title || runtimeId }}
                </div>
                <div class="text-xs text-dimmed">
                  {{ portfolioPill?.subtitle || 'No region label' }} · mode {{ runtimeMode }}
                </div>
              </div>

              <UButton
                to="/dashboard/portfolios"
                size="sm"
                variant="soft"
                icon="i-lucide-repeat"
              >
                Change selection
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="space-y-1">
                <div class="text-sm font-semibold">Property workspace</div>
                <div class="text-xs text-dimmed">
                  Portfolio-scoped properties from
                  <code>portfolios/{{ runtimeId }}/properties</code>.
                </div>
              </div>
            </template>

            <div v-if="properties.length" class="space-y-3">
              <div
                v-for="property in properties"
                :key="property.id"
                class="rounded border border-default p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">{{ property.name || property.id }}</div>
                    <div class="text-xs text-dimmed">
                      {{ property.address_line || 'No address' }}
                      <template v-if="property.city"> · {{ property.city }}</template>
                      <template v-if="property.postcode"> · {{ property.postcode }}</template>
                    </div>
                    <div class="text-xs text-dimmed">
                      Units: {{ property.unit_count ?? 0 }} · Type: {{ property.property_type || 'unset' }}
                    </div>
                  </div>

                  <UButton
                    size="xs"
                    variant="ghost"
                    :to="`/properties/${encodeURIComponent(property.id || '')}`"
                    :disabled="!property.id"
                    icon="i-lucide-external-link"
                  >
                    Open
                  </UButton>
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="No properties found"
              description="Add property records to this portfolio to unlock compliance, documents, and tasks context."
            />
          </UCard>
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

definePageMeta({
  layout: 'granite-console',
  nav: {
    visibility: { ecosystems: ['granite'], modules: ['fireux-properties'] },
    key: 'console-portfolio-properties',
    label: 'Properties',
    icon: 'i-lucide-building',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['granite-console'],
    group: 'granite',
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
</script>
