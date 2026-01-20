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
import { usePlaces } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/usePlaces'
import { computed } from 'vue'
import { useCompanyFetch } from '../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'

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
  name: 'CompaniesIndexPage',
})

const pageTitle = 'Companies'
const pageDescription = 'Browse companies available to this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { companies } = useCompanyFetch()
const { collection: placesCollection } = usePlaces<Record<string, any>>()

const placesById = computed(() => {
  const map = new Map<string, Record<string, any>>()
  for (const place of placesCollection.value ?? []) {
    if (place?.id) map.set(String(place.id), place)
  }
  return map
})

const mergedCompanies = computed(() =>
  (companies.value ?? []).map((company) => {
    const place = placesById.value.get(String(company.id))
    if (!place) return company
    return {
      ...place,
      ...company,
      id: company.id,
      name: company.name || place.name || '',
      formatted_address: company.formatted_address || place.formatted_address || '',
      lat: Number.isFinite(company.lat) ? company.lat : place.lat,
      lng: Number.isFinite(company.lng) ? company.lng : place.lng,
      place_image: company.place_image || place.place_image || '',
      place_source: company.place_source || place.source || '',
    }
  })
)

const collection = computed(() => mergedCompanies.value)

</script>
