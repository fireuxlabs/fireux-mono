<!-- FILE: packages/extensions/fireux-jobs/src/runtime/job/componentss/Create/Preview.vue -->
<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: preview categories and generic workplaces. -->
<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: preview canonical Place, contract, schedule, and compensation truth. -->
<!-- NOTE for Copilot:
  - This is the PREVIEW surface for job creation.
  - It renders the SAME shape as useJobCreate().form.
  - This card will later mirror the pipeline/job list UI.
-->

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-wide text-dimmed">Preview</p>
          <h3 class="text-base font-semibold text-highlighted">
            {{ title }}
          </h3>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge size="xs" variant="soft" color="primary">{{
              statusLabel
            }}</UBadge>
            <UBadge size="xs" variant="soft" color="neutral">
              {{ contractTypeLabel }}
            </UBadge>
            <UBadge size="xs" variant="soft" color="neutral">
              {{ managementModeLabel }}
            </UBadge>
            <UBadge size="xs" variant="soft" color="neutral">
              {{ openingsLabel }}
            </UBadge>
            <UBadge v-if="categoryId" size="xs" variant="soft" color="neutral">
              Category: {{ categoryId }}
            </UBadge>
            <UBadge v-if="businessId" size="xs" variant="soft" color="neutral">
              Business: {{ businessId }}
            </UBadge>
          </div>
        </div>

        <div v-if="agentCard" class="min-w-[220px]">
          <p class="text-xs uppercase tracking-wide text-dimmed">Posted by</p>
          <AgentCardsPill
            v-bind="agentCard"
            :badges="agentCard?.badges ?? []"
            :show-subtitle="false"
            :link="Boolean(agentCard.to)"
            class="block"
          />
        </div>
      </div>
    </template>

    <div class="space-y-4 text-sm text-toned">
      <div class="rounded-lg border border-default bg-muted/60 p-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-dimmed">
              Location
            </p>
            <PlacePill v-if="placeId" :id="placeId" />
            <p v-else class="text-sm text-default">Not selected</p>
          </div>
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-dimmed">Business</p>
            <BusinessPill v-if="businessId" :id="businessId" />
            <p v-else class="text-sm text-default">Not set</p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-default bg-muted/60 p-4">
          <p class="text-xs uppercase tracking-wide text-dimmed">Schedule</p>
          <p class="mt-1 text-sm text-default">{{ scheduleLabel }}</p>
        </div>

        <div class="rounded-lg border border-default bg-muted/60 p-4">
          <p class="text-xs uppercase tracking-wide text-dimmed">Compensation</p>
          <p class="mt-1 text-sm text-default">{{ compensationLabel }}</p>
        </div>
      </div>

      <div class="rounded-lg border border-default bg-muted/60 p-4">
        <p class="text-xs uppercase tracking-wide text-dimmed">Description</p>
        <p class="whitespace-pre-line text-sm text-default">
          {{ description || 'No description yet.' }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useBusinessDetail } from 'fireux-businesses/runtime/business/composables/business/useBusinessDetail'
import { useBusinessInterface } from 'fireux-businesses/runtime/business/composables/business/useBusinessInterface'
import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/fetch/usePlaceFetch'
import { usePlaceInterface } from 'fireux-places/runtime/place/composables/firestore/utils/view/usePlaceInterface'
import { computed, defineComponent } from 'vue'
import { useAgent } from '../../../user/composables/profiles/Agent/useAgent'
import {
  formatJobCompensation,
  formatJobContractType,
  formatJobManagementMode,
  formatJobOpenings,
  formatJobSchedule,
} from '../../composables/firestore/utils/view/useJobInterface'

import type { JobCreateForm } from '../../composables/firestore/mutations/useJobCreate'

const BusinessPill = defineComponent({
  props: { id: String },
  setup(props) {
    const businessId = computed(() => String(props.id || '').trim())
    const { place: businessData } = useBusinessDetail(businessId)
    const businessInterface = useBusinessInterface()
    const businessCard = computed(() => businessInterface.pill(businessData.value))
    return { businessCard }
  },
  template: `
    <div v-if="businessCard" class="pill">
      <UUser
        :name="businessCard.title"
        :description="businessCard.subtitle"
        :avatar="{ src: businessCard.imageUrl, alt: businessCard.title }"
        size="sm"
      />
    </div>
    <p v-else class="break-all text-xs text-muted">{{ id }}</p>
  `,
})

const PlacePill = defineComponent({
  props: { id: String },
  setup(props) {
    const placeId = computed(() => String(props.id || '').trim())
    const { place } = usePlaceFetch(placeId)
    const placeInterface = usePlaceInterface()
    const placeCard = computed(() => placeInterface.pill(place.value))
    return { placeCard }
  },
  template: `
    <div v-if="placeCard" class="pill">
      <UUser
        :name="placeCard.title"
        :description="placeCard.subtitle"
        :avatar="{ src: placeCard.imageUrl, alt: placeCard.title }"
        size="sm"
      />
    </div>
    <p v-else class="break-all text-xs text-muted">{{ id }}</p>
  `,
})

const props = defineProps<{
  form: JobCreateForm
}>()

const { agentProfile, pill: agentInterface } = useAgent()
const agentCard = computed(() =>
  agentProfile.value ? agentInterface(agentProfile.value) : null
)

const title = computed(() => props.form.title.trim() || 'Untitled job')
const description = computed(() => props.form.description.trim())
const placeId = computed(() => props.form.place_id.trim())
const businessId = computed(() => props.form.business_id.trim())
const categoryId = computed(() => props.form.category_id.trim())
const statusLabel = 'Private draft'
const contractTypeLabel = computed(() =>
  formatJobContractType(props.form.contract_type)
)
const managementModeLabel = computed(() =>
  formatJobManagementMode(props.form.management_mode)
)
const openingsLabel = computed(() =>
  formatJobOpenings(props.form.openings_count)
)
const compensationLabel = computed(() =>
  formatJobCompensation(props.form.compensation)
)
const scheduleLabel = computed(() =>
  formatJobSchedule(props.form.start_at, props.form.end_at)
)
</script>
