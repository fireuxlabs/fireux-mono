<!-- Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: remove public Business self-claim controls until verified ownership proof exists. -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/businesses"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody class="pagebody">
      <FireStateCard
        v-if="outcome === 'pending'"
        entity="business"
        state="loading"
      />
      <FireStateCard
        v-else-if="outcome === 'error'"
        entity="business"
        state="error"
        @retry="refresh"
      />
      <FireStateCard
        v-else-if="outcome === 'empty'"
        entity="business"
        state="empty"
        title="Business not found"
        description="This business does not exist or is no longer available."
      />
      <div v-else>
        <BusinessDetailProfile
          v-if="businessProfile"
          :model="businessProfile"
        />

        <FireDiagnosticsDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Business"
          context="Business detail · canonical Business with explicitly linked Place"
          :objects="business ? [business] : []"
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
import { useBusinessDetail } from '../../../business/composables/business/useBusinessDetail'
import { useBusinessInterface } from '../../../business/composables/business/useBusinessInterface'
import { useBusinessSeo } from '../../../business/composables/firestore/business/utils/useBusinessSeo'

definePageMeta({
  layout: 'default',
  title: 'Business',
  description: 'View a saved business.',
  head: { title: 'Business' },
})

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { business, place, ready, outcome, empty, failed, statusCode, refresh } =
  useBusinessDetail(docId)

await ready
if (import.meta.server && empty.value) {
  setResponseStatus(404)
} else if (import.meta.server && failed.value) {
  setResponseStatus(statusCode.value || 503)
}

const pageTitle = computed(() => business.value?.name || 'Business')
const pageDescription = computed(
  () => place.value?.short_address || 'Review the business profile.'
)

const { profile } = useBusinessInterface()
const businessProfile = computed(() => profile(business.value))

useBusinessSeo(business)
</script>
