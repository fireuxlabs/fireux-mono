<template>
  <ClientOnly>
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

        <div v-else class="space-y-4">
          <PlaceCardsPreview
            v-if="placePreview"
            v-bind="placePreview"
            :show-badges="false"
            :show-body="false"
          />

          <UAlert
            v-if="!canEdit"
            color="warning"
            variant="soft"
            title="Claim required"
            description="You can only edit places you’ve claimed. Ask an admin or claim this business first."
          >
            <template #actions>
              <UButton
                size="xs"
                variant="soft"
                color="primary"
                :to="companyId ? `/companies/${encodeURIComponent(companyId)}` : '/companies'"
              >
                Go to details
              </UButton>
            </template>
          </UAlert>

          <OrganismsEntitiesCompanyEdit :company="company" />
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading company…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { usePlacesInterface } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import { computed } from 'vue'
import { useCompanyFetch } from '../../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import type { CompanyView } from '../../../models/objects/company.model'

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

const company = computed<CompanyView | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(companyId) && docRef?.value === undefined)

const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() => String(company.value?.claimed_by ?? '').trim())
const canEdit = computed(() => {
  if (!claimedBy.value) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || currentUser.value?.id === claimedBy.value)
})

const { preview } = usePlacesInterface()
const placePreview = computed(() => preview(company.value as any))

const pageTitle = computed(() => company.value?.name || 'Edit company')
const pageSubtitle = computed(() =>
  companyId ? `Company: ${companyId}` : 'Edit a company'
)
</script>
