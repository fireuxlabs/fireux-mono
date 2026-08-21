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
          v-else-if="!place"
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
            title="Administrator access required"
            description="Company editing is currently available to administrators."
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

          <CompanyEdit v-if="canEdit" :place="place" />
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Editing locked"
            description="Company editing is currently available to administrators."
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
import { setResponseStatus, useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { computed } from 'vue'
import { useCompanyDetail } from '../../../place/composables/company/useCompanyDetail'
import { useCompanyInterface } from '../../../place/composables/company/useCompanyInterface'

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

const { place, ready, pending: loading, missing, failed, statusCode } =
  useCompanyDetail(companyId)

await ready
if (import.meta.server && missing.value) {
  setResponseStatus(404)
} else if (import.meta.server && failed.value) {
  setResponseStatus(statusCode.value || 503)
}

const { isAdmin } = useUser()
const canEdit = computed(() => Boolean(isAdmin.value))

const { preview } = useCompanyInterface()
const companyPreview = computed(() => preview(place.value))
const companyPreviewDetails = computed(() => {
  const v = place.value
  if (!v) return []
  const details = [
    { label: 'Short name', value: v.short_name ?? '' },
    { label: 'Short address', value: v.short_address ?? '' },
    { label: 'Brand tagline', value: (v as any).brand_tagline ?? '' },
    { label: 'About', value: (v as any).about ?? '' },
    { label: 'Phone', value: v.phone ?? '' },
    { label: 'Website', value: v.website ?? '' },
    { label: 'Verified', value: v.verified ? 'Yes' : '' },
  ]

  return details.filter((item) => String(item.value ?? '').trim().length > 0)
})
const companyPreviewMapUrl = computed(() => {
  const v = place.value
  if (!v) return ''
  if (v.google_maps_url) return v.google_maps_url
  return ''
})

const pageTitle = computed(() => place.value?.name || 'Edit company')
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
