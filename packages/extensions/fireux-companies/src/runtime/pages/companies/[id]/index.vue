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

          <!-- operator -->
          <CompanyPublicOperatorPanel :company="company" :id="docId" />
          <DevJson
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
import { computed } from 'vue'
import {
  useCompanyFetch,
  useCompanyInterface,
  useCompanySeo,
} from '../../../composables/fireux/firestore/company/useCompany'

definePageMeta({
  layout: 'default',
  title: 'Company',
  description: 'View a saved company.',
  head: { title: 'Company' },
})

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { company, pending: loading } = useCompanyFetch(docId)

const pageTitle = computed(() => company.value?.name || 'Company')
const pageDescription = computed(() =>
  company.value?.formatted_address || company.value?.website || 'Review the public company record and its underlying place ownership.'
)

const { profile } = useCompanyInterface()
const companyProfile = computed(() => profile(company.value))

useCompanySeo(company)

</script>
