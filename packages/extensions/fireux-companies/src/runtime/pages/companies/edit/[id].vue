<template>
  <UPage class="page edit-page">
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="companyId ? `/companies/${encodeURIComponent(companyId)}` : '/companies'"
        >
          Back to details
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UPageCard v-if="loading" variant="subtle">
        <p class="text-sm text-dimmed">Loading company…</p>
      </UPageCard>

      <UAlert
        v-else-if="!company"
        color="error"
        variant="soft"
        title="Company not found"
        description="We could not find this company. Return to the companies list and try again."
      />

      <LayoutsDashboardProfileEdit v-else class="panels-masonry">
        <template #preview>
          <CompanyCardsPreview
            :avatar-url="company.image_url ?? company.place_image ?? ''"
            :name="company.name ?? ''"
            :website="company.website ?? ''"
            :badges="[]"
            :show-body="false"
          />
        </template>

        <template #core>
          <OrganismsEntitiesCompanyEdit :company="company" />
        </template>
      </LayoutsDashboardProfileEdit>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useCompanyFetch } from '../../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import type { Company } from '../../../models/objects/company.model'

definePageMeta({
  layout: 'default',
  title: 'Edit Company',
  description: 'Edit a saved company.',
  head: { title: 'Edit Company' },
  name: 'CompaniesEditPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Company` })

const route = useRoute()
const raw = route.params.id
const companyId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { company: fetchCompany } = useCompanyFetch()
const docRef = companyId ? fetchCompany(companyId) : null

const company = computed<Company | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(companyId) && docRef?.value === undefined)
const pageTitle = computed(() => company.value?.name || 'Edit company')
const pageSubtitle = computed(() =>
  companyId ? `Company: ${companyId}` : 'Edit a company'
)
</script>
