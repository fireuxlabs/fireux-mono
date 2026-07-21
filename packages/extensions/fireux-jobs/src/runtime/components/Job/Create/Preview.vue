<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Jobs/Create/Preview.vue -->
<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: preview categories and generic workplaces. -->
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
            <UBadge v-if="workplaceId" size="xs" variant="soft" color="neutral">
              Workplace: {{ workplaceId }}
            </UBadge>
            <UBadge v-if="categoryId" size="xs" variant="soft" color="neutral">
              Category: {{ categoryId }}
            </UBadge>
            <UBadge v-if="companyId" size="xs" variant="soft" color="neutral">
              Company: {{ companyId }}
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
              Workplace
            </p>
            <div v-if="workplaceId" class="space-y-1 text-sm text-default">
              <p class="font-medium">{{ workplaceLabel || workplaceId }}</p>
              <p class="text-xs text-muted">Type: {{ workplaceType }}</p>
              <p class="break-all text-xs text-muted">ID: {{ workplaceId }}</p>
            </div>
            <p v-else class="text-sm text-default">Not selected</p>
          </div>
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-dimmed">Company</p>
            <CompanyPill v-if="companyId" :id="companyId" />
            <p v-else class="text-sm text-default">Not set</p>
          </div>
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
import { useCompanyFetch } from 'fireux-companies/runtime/composables/fireux/firestore/company/fetch/useCompanyFetch'
import { useCompanyInterface } from 'fireux-companies/runtime/composables/fireux/firestore/company/utils/view/useCompanyInterface'
import { computed, defineComponent } from 'vue'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

import type { JobCreateForm } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

const CompanyPill = defineComponent({
  props: { id: String },
  setup(props) {
    const companyId = computed(() => String(props.id || '').trim())
    const { company: companyData } = useCompanyFetch(companyId)
    const companyInterface = useCompanyInterface()
    const companyCard = computed(() => companyInterface.pill(companyData.value))
    return { companyCard }
  },
  template: `
    <div v-if="companyCard" class="pill">
      <UUser
        :name="companyCard.title"
        :description="companyCard.subtitle"
        :avatar="{ src: companyCard.imageUrl, alt: companyCard.title }"
        size="sm"
      />
    </div>
  `,
})

const props = defineProps<{
  form: JobCreateForm
}>()

const { coreProfile, pill: agentInterface } = useAgent()
const agentCard = computed(() =>
  coreProfile.value ? agentInterface(coreProfile.value) : null
)

const title = computed(() => props.form.title.trim() || 'Untitled job')
const description = computed(() => props.form.description.trim())
const workplaceId = computed(() => props.form.workplace_id.trim())
const workplaceType = computed(() => props.form.workplace_type.trim())
const workplaceLabel = computed(() => props.form.workplace_label.trim())
const companyId = computed(() => props.form.company_id.trim())
const categoryId = computed(() => props.form.category_id.trim())
const statusLabel = computed(() =>
  props.form.status === 'closed' ? 'Closed' : 'Open'
)
</script>
