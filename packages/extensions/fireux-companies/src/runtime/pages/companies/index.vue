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
    const name = company.name || place.name || ''
    const formattedAddress = company.formatted_address || place.formatted_address || ''
    const searchTerm = company.search_term || `${name} ${formattedAddress}`.toLowerCase().trim()
    const searchTermNormalized =
      company.search_term_normalized || searchTerm
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    return {
      ...place,
      ...company,
      id: company.id,
      name,
      formatted_address: formattedAddress,
      lat: Number.isFinite(company.lat)
        ? company.lat
        : Number.isFinite(place.lat)
          ? place.lat
          : 0,
      lng: Number.isFinite(company.lng)
        ? company.lng
        : Number.isFinite(place.lng)
          ? place.lng
          : 0,
      place_image: company.place_image || place.place_image || '',
      website: company.website || '',
      search_term: searchTerm,
      search_term_normalized: searchTermNormalized,
    }
  })
)

const collection = computed(() => mergedCompanies.value)

</script>
