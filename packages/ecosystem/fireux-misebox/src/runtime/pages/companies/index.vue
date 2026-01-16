<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/companies/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <CompanyCTA />
      <CompanyCollectionManager :cards="cards" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useCompanyFetch } from 'fireux-companies/runtime/composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanyInterface } from 'fireux-companies/runtime/composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Companies',
  description: 'Saved companies.',
  nav: {
    key: 'companies',
    label: 'Companies',
    icon: 'i-lucide-building-2',
    order: 24,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  head: { title: 'Companies' },
  name: 'CompaniesIndexPage',
})

const pageTitle = 'Companies'
const pageDescription =
  'Create a company and browse all companies available to this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { companies } = useCompanyFetch()
const { card: makeCard } = useCompanyInterface()

const cards = computed(() =>
  (companies.value ?? [])
    .map((company) => makeCard(company))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)
</script>
