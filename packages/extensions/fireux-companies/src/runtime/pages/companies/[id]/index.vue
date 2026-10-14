<!-- Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: remove public Company self-claim controls until verified ownership proof exists. -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/companies"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody class="pagebody">
      <MoleculesStateCard
        v-if="outcome === 'pending'"
        entity="company"
        state="loading"
      />
      <MoleculesStateCard
        v-else-if="outcome === 'error'"
        entity="company"
        state="error"
        @retry="refresh"
      />
      <MoleculesStateCard
        v-else-if="outcome === 'missing'"
        entity="company"
        state="empty"
        title="Company not found"
        description="This company does not exist or is no longer available."
      />
      <div v-else class="space-y-4">
        <CompanyCardsProfile
          v-if="companyProfile"
          :model="companyProfile"
        />

<DiagnosticsDebugPanel
  object-origin="fetched"
          launcher
          include-route
          title="Company"
          context="Company detail · canonical Company with same-id Place"
          :objects="company ? [company] : []"
          :derived="{ place }"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { setResponseStatus, useRoute } from '#imports'
import { computed } from 'vue'
import { useCompanyDetail } from '../../../place/composables/company/useCompanyDetail'
import { useCompanyInterface } from '../../../place/composables/company/useCompanyInterface'
import { useCompanySeo } from '../../../place/composables/firestore/company/utils/useCompanySeo'

definePageMeta({
  layout: 'default',
  title: 'Company',
  description: 'View a saved company.',
  head: { title: 'Company' },
})

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { company, place, ready, outcome, missing, failed, statusCode, refresh } =
  useCompanyDetail(docId)

await ready
if (import.meta.server && missing.value) {
  setResponseStatus(404)
} else if (import.meta.server && failed.value) {
  setResponseStatus(statusCode.value || 503)
}

const pageTitle = computed(() => place.value?.name || 'Company')
const pageDescription = computed(() =>
  place.value?.short_address || 'Review the company profile.'
)

const { profile } = useCompanyInterface()
const companyProfile = computed(() => profile(place.value))

useCompanySeo(place)
</script>
