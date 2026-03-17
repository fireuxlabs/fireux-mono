<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      :description="pageDescription"
      class="border-b-0"
    >
      <template #right>
        <UButton to="/console/portfolio/properties" size="sm" variant="soft" icon="i-lucide-arrow-left">
          Back to console
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody space-y-6">
      <UAlert
        v-if="!runtimeId"
        color="warning"
        variant="soft"
        title="No portfolio selected"
        description="Select a portfolio before opening property details."
        :actions="[{ label: 'Go to portfolios', to: '/portfolios', icon: 'i-lucide-arrow-right' }]"
      />

      <UAlert
        v-else-if="!property"
        color="warning"
        variant="soft"
        title="Property not found"
        :description="`No property found for id '${propertyId || 'unset'}' in the active runtime context.`"
      />

      <template v-else>
        <UCard>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div class="text-xs text-dimmed">Property ID</div>
              <div class="font-mono text-sm">{{ property.id || 'unset' }}</div>
            </div>
            <div>
              <div class="text-xs text-dimmed">Type</div>
              <div class="text-sm">{{ property.property_type || 'unset' }}</div>
            </div>
            <div>
              <div class="text-xs text-dimmed">Status</div>
              <div class="text-sm">{{ property.status || 'unset' }}</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Units</div>
              <div class="text-xs text-dimmed">Scoped to <code>properties/{{ property.id }}/units</code>.</div>
            </div>
          </template>

          <div v-if="units.length" class="space-y-2">
            <div
              v-for="unit in units"
              :key="unit.id"
              class="rounded border border-default p-3"
            >
              <div class="flex items-center justify-between gap-2">
                <div>
                  <div class="text-sm font-semibold">{{ unit.label || unit.id }}</div>
                  <div class="text-xs text-dimmed">
                    {{ unit.unit_type || 'unset' }} · {{ unit.bedrooms ?? 0 }} bed · {{ unit.bathrooms ?? 0 }} bath
                  </div>
                </div>
                <UBadge :color="unit.status === 'occupied' ? 'success' : unit.status === 'vacant' ? 'warning' : 'neutral'" variant="soft">
                  {{ unit.status || 'unset' }}
                </UBadge>
              </div>
            </div>
          </div>

          <UAlert
            v-else
            color="neutral"
            variant="soft"
            title="No units"
            description="This property currently has no unit records in the active runtime context."
          />
        </UCard>

        <div class="grid gap-4 lg:grid-cols-2">
          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Compliance panel scaffold</div>
            </template>
            <p class="text-sm text-dimmed">
              Compliance records are managed on <code>/console/portfolio/compliance</code> and filtered by this property id.
            </p>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Documents panel scaffold</div>
            </template>
            <p class="text-sm text-dimmed">
              Documents and document links are managed on <code>/console/portfolio/documents</code>.
            </p>
          </UCard>
        </div>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimePortfolio } from '../../composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { usePropertyDocument } from '../../composables/fireux/firestore/property/fetch/usePropertyDocument'
import { usePropertyUnitCollection } from '../../composables/fireux/firestore/unit/fetch/usePropertyUnitCollection'

definePageMeta({
  layout: 'default',
  title: 'Property detail',
  description: 'Property detail panels for units, compliance, and documents.',
})

const route = useRoute()
const runtimePortfolio = useRuntimePortfolio()

const propertyId = computed(() => String(route.params.id || '').trim())
const runtimeId = computed(() => runtimePortfolio.id.value)

const { document } = usePropertyDocument(() => propertyId.value, runtimePortfolio)
const property = computed(() => document.value)
const { collection } = usePropertyUnitCollection(() => propertyId.value, runtimePortfolio)

const units = computed(() => collection.value)
const pageTitle = computed(() => property.value?.name || property.value?.id || 'Property')
const pageDescription = computed(
  () =>
    [property.value?.address_line, property.value?.city, property.value?.postcode]
      .filter((value) => String(value || '').trim().length > 0)
      .join(' · ') || 'Address not set'
)
</script>
