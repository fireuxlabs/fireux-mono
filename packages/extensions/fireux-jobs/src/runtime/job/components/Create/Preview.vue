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
      <div class="card__header">
        <div class="fx-card-body-stack">
          <p>Preview</p>
          <h3 class="fx-type-card-heading">
            {{ title }}
          </h3>

          <div class="card__badges">
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

        <div v-if="agentCard">
          <p>Posted by</p>
          <AgentCardsPill
            v-bind="agentCard"
            :badges="agentCard?.badges ?? []"
            :show-subtitle="false"
            :link="Boolean(agentCard.to)"
          />
        </div>
      </div>
    </template>

    <div class="fx-card-body-stack">
      <UCard :ui="{ body: 'fx-card-body-stack' }">
        <div>
          <div class="fx-card-body-stack">
            <p>Location</p>
            <PlacePill v-if="placeId" :id="placeId" />
            <p v-else>Not selected</p>
          </div>
          <div class="fx-card-body-stack">
            <p>Business</p>
            <BusinessPill v-if="businessId" :id="businessId" />
            <p v-else>Not set</p>
          </div>
        </div>
      </UCard>

      <UPageGrid>
        <UCard :ui="{ body: 'fx-card-body-stack' }">
          <p>Schedule</p>
          <p>{{ scheduleLabel }}</p>
        </UCard>

        <UCard :ui="{ body: 'fx-card-body-stack' }">
          <p>Compensation</p>
          <p>{{ compensationLabel }}</p>
        </UCard>
      </UPageGrid>

      <UCard :ui="{ body: 'fx-card-body-stack' }">
        <p>Description</p>
        <p class="whitespace-pre-line">
          {{ description || 'No description yet.' }}
        </p>
      </UCard>
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
    const businessCard = computed(() =>
      businessInterface.pill(businessData.value)
    )
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
