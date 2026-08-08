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
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-copy"
          :disabled="!companyId"
          aria-label="Copy company id"
          @click="onCopyCompanyId"
        />
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <ClientOnly>
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
          <CompanyCardsPreview
            v-if="companyPreview"
            v-bind="companyPreview"
            :show-badges="false"
            :show-body="false"
            :details="companyPreviewDetails"
            :map-url="companyPreviewMapUrl"
          />

          <UAlert
            v-if="!canEdit"
            color="warning"
            variant="soft"
            title="Claim required"
            description="You can only edit companies backed by places you’ve claimed. Ask an admin or claim the underlying business first."
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

          <CompanyEdit v-if="canEdit" :company="company" />
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Editing locked"
            description="Only the claiming user or an admin can edit this company record."
          />
        </div>

        <template #fallback>
          <div class="py-10 text-sm opacity-70">Loading company…</div>
        </template>
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useUser } from 'fireux-core/runtime/composables/fireux/user/useUser'
import { computed } from 'vue'
import { useCompanyFetch } from '../../../composables/fireux/firestore/company/fetch/useCompanyFetch'
import { useCompanyInterface } from '../../../composables/fireux/firestore/company/utils/view/useCompanyInterface'
import type { CompanyHydrated } from '../../../composables/fireux/firestore/company/fetch/types'

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

const company = computed<CompanyHydrated | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(companyId) && docRef?.value === undefined)

const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() => String(company.value?.claimed_by ?? '').trim())
const canEdit = computed(() => {
  if (!claimedBy.value) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || currentUser.value?.id === claimedBy.value)
})

const { preview } = useCompanyInterface()
const companyPreview = computed(() => preview(company.value))
const companyPreviewDetails = computed(() => {
  const v = company.value
  if (!v) return []
  const details = [
    { label: 'Short name', value: v.short_name ?? '' },
    { label: 'Short address', value: v.short_address ?? '' },
    { label: 'Brand tagline', value: (v as any).brand_tagline ?? '' },
    { label: 'About', value: (v as any).about ?? '' },
    { label: 'Phone', value: v.phone ?? '' },
    { label: 'Website', value: v.website ?? '' },
    { label: 'Claimed by', value: v.claimed_by ?? '' },
    { label: 'Verified', value: v.verified ? 'Yes' : '' },
  ]

  return details.filter((item) => String(item.value ?? '').trim().length > 0)
})
const companyPreviewMapUrl = computed(() => {
  const v = company.value
  if (!v) return ''
  if (v.google_maps_url) return v.google_maps_url
  return ''
})

const pageTitle = computed(() => company.value?.name || 'Edit company')
const pageSubtitle = computed(() =>
  companyId ? `Company ID: ${companyId}` : 'Edit a company'
)

const toast = useToastify()

async function onCopyCompanyId() {
  if (!companyId) return
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(companyId)
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.value = companyId
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    toast.success('Company ID copied')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to copy company ID: ${msg}`)
  }
}
</script>
