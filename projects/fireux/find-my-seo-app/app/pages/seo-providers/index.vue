<template>
  <UPage>
    <UPageHeader
      title="Browse SEO providers"
      description="Compare consultants and agencies by specialism, sector fit, project type, and trust signals."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <div class="grid gap-3 md:grid-cols-4">
          <UInput v-model="query" placeholder="Search provider, service, or sector..." />
          <select v-model="selectedSpecialism" class="rounded-md border border-default bg-default px-3 py-2 text-sm">
            <option v-for="option in specialismOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <select v-model="selectedProjectType" class="rounded-md border border-default bg-default px-3 py-2 text-sm">
            <option v-for="option in projectTypeOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <select v-model="selectedSector" class="rounded-md border border-default bg-default px-3 py-2 text-sm">
            <option v-for="option in sectorOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
      </UCard>

      <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <FindmyseoProviderCard
          v-for="provider in filteredProviders"
          :key="provider.id"
          :provider="provider"
        />
      </div>

      <UAlert
        v-if="!filteredProviders.length"
        color="neutral"
        variant="soft"
        title="No matches yet"
        description="Try a broader search or reset one of the filters."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { appMeta } from '../../content/meta'
import { allProjectTypeOptions, allSectorOptions, allSpecialismOptions, seoProviders } from '../../content/findMySeo'

useSeoMeta({
  title: appMeta.seoBrowse.title,
  description: appMeta.seoBrowse.description,
})

const route = useRoute()

const query = ref('')
const selectedSpecialism = ref('All specialisms')
const selectedProjectType = ref('All project types')
const selectedSector = ref('All sectors')

const specialismOptions = ['All specialisms', ...allSpecialismOptions]
const projectTypeOptions = ['All project types', ...allProjectTypeOptions]
const sectorOptions = ['All sectors', ...allSectorOptions]

watch(
  () => route.query.sector,
  (sector) => {
    selectedSector.value = typeof sector === 'string' && sectorOptions.includes(sector) ? sector : 'All sectors'
  },
  { immediate: true }
)

const filteredProviders = computed(() => {
  const q = query.value.trim().toLowerCase()

  return [...seoProviders]
    .sort((left, right) => {
      if (left.isFeatured !== right.isFeatured) {
        return left.isFeatured ? -1 : 1
      }

      return left.displayName.localeCompare(right.displayName)
    })
    .filter((item) => {
      const searchMatch =
        !q ||
        [
          item.displayName,
          item.brandName,
          item.headline,
          ...item.specialisms,
          ...item.sectorExperience,
          ...item.servicesOffered,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)

      const specialismMatch =
        selectedSpecialism.value === 'All specialisms' ||
        item.specialisms.includes(selectedSpecialism.value)

      const projectTypeMatch =
        selectedProjectType.value === 'All project types' ||
        item.projectTypes.includes(selectedProjectType.value)

      const sectorMatch =
        selectedSector.value === 'All sectors' ||
        item.sectorExperience.includes(selectedSector.value)

      return searchMatch && specialismMatch && projectTypeMatch && sectorMatch
    })
})
</script>
