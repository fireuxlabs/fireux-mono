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
        <UButton
          v-if="canEditAsAdmin || canEditAsClaimer"
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-pencil"
          :disabled="!docId"
          :to="editTo"
        >
          Manage company
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody class="pagebody">
      <ClientOnly>
        <div v-if="loading" class="py-10 text-sm opacity-70">
          Loading company…
        </div>
        <div v-else-if="!company" class="space-y-2">
          <h1 class="text-lg font-semibold">Company Not Found</h1>
          <p>The company you’re looking for doesn’t exist.</p>
          <NuxtLink to="/companies" class="text-primary hover:underline">
            ← Back
          </NuxtLink>
        </div>
        <div v-else class="space-y-4">
          <CompanyCardsProfile
            v-if="companyProfile"
            :model="companyProfile"
          />
          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Claim</div>
            </template>
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500">Claimed by</span>
              <UserCardsPill
                v-if="claimedUserPill"
                v-bind="claimedUserPill"
                :show-subtitle="false"
                :link="Boolean(claimedUserPill.to)"
              />
              <span v-else class="text-xs text-gray-500">—</span>
            </div>
            <div v-if="showClaimButton" class="pt-3">
              <UButton
                size="xs"
                variant="soft"
                color="primary"
                :loading="isClaiming"
                :disabled="isClaiming"
                @click="onClaim"
              >
                Claim this company record
              </UButton>
            </div>
          </UCard>
          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Details</div>
            </template>
            <div class="space-y-2 text-sm">
              <div v-for="item in details" :key="item.label">
                <div class="text-xs uppercase tracking-wide text-gray-400">
                  {{ item.label }}
                </div>
                <div class="font-medium">
                  {{ item.value }}
                </div>
              </div>
              <div v-if="mapUrl" class="pt-2">
                <UButton
                  size="xs"
                  variant="soft"
                  color="primary"
                  icon="i-lucide-map-pin"
                  :to="mapUrl"
                  target="_blank"
                >
                  View map
                </UButton>
              </div>
            </div>
          </UCard>
          <DevJson
            v-if="isDev && company"
            :title="'Company (Doc)'"
            context="Company detail page · companies/[id] · hydrated company doc"
            :data="company"
            :default-open="false"
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
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { usePlaceClaim } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceClaim'
import { computed, ref } from 'vue'
import { useCompanyFetch } from '../../composables/fireux/firestore/company/fetch/useCompanyFetch'
import { useCompanySeo } from '../../composables/fireux/firestore/company/seo/useCompanySeo'
import { useCompanyInterface } from '../../composables/fireux/firestore/company/utils/view/useCompanyInterface'
import type { CompanyHydrated } from '../../composables/fireux/firestore/company/fetch/types'

definePageMeta({
  layout: 'default',
  title: 'Company',
  description: 'View a saved company.',
  head: { title: 'Company' },
})

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const editTo = computed(() =>
  docId ? `/companies/edit/${encodeURIComponent(docId)}` : '/companies'
)

const { company: fetchCompany } = useCompanyFetch()
const rawDoc = docId ? await fetchCompany(docId) : null

const company = computed<CompanyHydrated | null>(
  () => (rawDoc as any)?.value ?? rawDoc ?? null
)

const loading = computed(() => !rawDoc && !!docId)

const pageTitle = computed(() => company.value?.name || 'Company')
const pageDescription = computed(() =>
  company.value?.formatted_address || company.value?.website || 'Review the public company record and its underlying place ownership.'
)
const isDev = import.meta.dev

const { profile } = useCompanyInterface()
const companyProfile = computed(() => profile(company.value))

const claimedBy = computed(() =>
  String(
    (company.value as any)?.claimed_by ??
    (company.value as any)?.card?.claimedBy ??
    ''
  ).trim()
)
const { user: claimedUser } = useUserFetch(claimedBy)
const { pill: userCard } = useUserInterface(claimedUser)
const claimedUserPill = computed(() => userCard(claimedUser.value))
const { currentUser, isAdmin } = useUser()
const isVerifiedUser = computed(() => Boolean((currentUser.value as any)?.verified || isAdmin.value))
const showClaimButton = computed(() => !claimedBy.value && isVerifiedUser.value)
const canEditAsAdmin = computed(() => Boolean(isAdmin.value))
const canEditAsClaimer = computed(() =>
  Boolean(currentUser.value?.id && currentUser.value.id === claimedBy.value)
)
const { claimPlace } = usePlaceClaim()
const toast = useToastify()
const isClaiming = ref(false)

const formatValue = (value: unknown) => {
  if (value == null) return ''
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value).trim()
}

const details = computed(() => {
  const v = company.value
  if (!v) return [] as Array<{ label: string; value: string }>

  const lat = Number(v.lat)
  const lng = Number(v.lng)
  const coords =
    Number.isFinite(lat) && Number.isFinite(lng) ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : ''

  const items = [
    { label: 'Short name', value: formatValue(v.short_name) },
    { label: 'Formatted address', value: formatValue(v.formatted_address) },
    { label: 'Short address', value: formatValue(v.short_address) },
    { label: 'Search term', value: formatValue((v as any).search_term) },
    { label: 'Source', value: formatValue(v.source) },
    { label: 'Coordinates', value: coords },
    { label: 'Website', value: formatValue(v.website) },
    { label: 'Image URL', value: formatValue((v as any).image_url) },
    { label: 'Image shade', value: formatValue(v.image_shade) },
    { label: 'Created', value: formatValue((v as any).created_at) },
    { label: 'Updated', value: formatValue((v as any).updated_at) },
  ]

  return items.filter((item) => item.value)
})

const mapUrl = computed(() => {
  const v = company.value
  if (!v) return ''
  const lat = Number(v.lat)
  const lng = Number(v.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
  return `https://maps.google.com/?q=${lat},${lng}`
})

const onClaim = async () => {
  if (isClaiming.value) return
  if (!docId || !showClaimButton.value) return
  isClaiming.value = true
  try {
    await claimPlace(docId)
    toast.success('Company record claimed')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to claim company record: ${msg}`)
  } finally {
    isClaiming.value = false
  }
}

useCompanySeo(company)

</script>
