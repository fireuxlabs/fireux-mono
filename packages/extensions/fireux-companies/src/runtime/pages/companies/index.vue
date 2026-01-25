<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <CompanyCTA />
      <CompanyCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useCompanyFetch } from '../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'

definePageMeta({
  layout: 'default',
  title: 'Companies',
  description: 'Company overlays resolved for this runtime.',
  nav: {
    key: 'companies',
    label: 'Companies',
    icon: 'i-lucide-building-2',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  name: 'CompaniesIndexPage',
})

const pageTitle = 'Companies'
const pageDescription =
  'Create a company and browse all companies available to this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { companies } = useCompanyFetch()
const collection = computed(() => companies.value ?? [])

</script>
