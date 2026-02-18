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
          <PlaceCardsPreview
            v-if="placePreview"
            v-bind="placePreview"
            :show-badges="false"
            :show-body="false"
            :details="placePreviewDetails"
            :map-url="placePreviewMapUrl"
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

          <PlaceEdit v-if="canEdit" :place="placeObject" />
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Editing locked"
            description="Only the claiming user or an admin can edit this place."
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
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { usePlacesInterface } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlacesInterface'
import { computed } from 'vue'
import { useCompanyFetch } from '../../../composables/fireux/firestore/company/fetch/useCompanyFetch'
import type { CompanyView } from '../../../models/company.model'

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
const placePreviewDetails = computed(() => {
  const v = company.value
  if (!v) return []
  const details = [
    { label: 'Short name', value: (v as any).short_name ?? '' },
    { label: 'Short address', value: (v as any).short_address ?? '' },
    { label: 'Search term', value: (v as any).search_term ?? '' },
    { label: 'Brand tagline', value: (v as any).brand_tagline ?? '' },
    { label: 'About', value: (v as any).about ?? '' },
    { label: 'Phone', value: (v as any).phone ?? '' },
    { label: 'Website', value: (v as any).website ?? '' },
    { label: 'Price level', value: (v as any).price_level ?? '' },
    { label: 'Rating', value: (v as any).rating ? String((v as any).rating) : '' },
    { label: 'Rating count', value: (v as any).rating_count ? String((v as any).rating_count) : '' },
    { label: 'Tags', value: Array.isArray((v as any).tags) ? (v as any).tags.filter(Boolean).join(', ') : '' },
    { label: 'Types', value: Array.isArray((v as any).types) ? (v as any).types.filter(Boolean).join(', ') : '' },
    { label: 'Hours', value: Array.isArray((v as any).hours_text) ? (v as any).hours_text.filter(Boolean).join(' · ') : '' },
    { label: 'Claimed by', value: (v as any).claimed_by ?? '' },
    { label: 'Verified', value: (v as any).verified ? 'Yes' : '' },
  ]

  return details.filter((item) => String(item.value ?? '').trim().length > 0)
})
const placePreviewMapUrl = computed(() => {
  const v = company.value as any
  if (!v) return ''
  if (v.google_maps_url) return v.google_maps_url
  return ''
})

const placeObject = computed(() => {
  if (!company.value) return null
  const {
    id, name, short_name, short_address, formatted_address, lat, lng,
    image_url, image_shade, claimed_by, source
  } = company.value as any
  return {
    id, name, short_name, short_address, formatted_address, lat, lng,
    image_url, image_shade, claimed_by, source
  }
})

const pageTitle = computed(() => company.value?.name || 'Edit company')
const pageSubtitle = computed(() =>
  companyId ? `Company: ${companyId}` : 'Edit a company'
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
