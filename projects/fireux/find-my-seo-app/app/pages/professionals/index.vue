<template>
  <UPage>
    <UPageHeader
      title="Browse SEO professionals"
      description="Compare consultants and agencies by specialism, sector fit, reviews, availability, and trust signals."
    />

    <UPageBody class="space-y-6">
      <ProfessionalCollectionManager
        :collection="filteredCollection"
        title="Professionals"
        description="Browse SEO professionals using the shared professional collection surface."
        initial-variant="cell"
      />

      <UAlert
        v-if="activeSector"
        color="neutral"
        variant="soft"
        title="Sector filter"
        :description="`Showing professionals with ${activeSector} experience.`"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProfessionalCollectionManager from 'fireux-jobs/runtime/components/Professional/Collection/Manager.vue'
import { appMeta } from '../../meta'
import { demoSeoProfessionalCollection } from '../../../../../../demo/find-my-seo.demo'

definePageMeta({
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-users',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.seoBrowse.title,
  description: appMeta.seoBrowse.description,
})

const route = useRoute()

const activeSector = computed(() =>
  typeof route.query.sector === 'string' ? route.query.sector.trim() : ''
)

const filteredCollection = computed(() =>
  demoSeoProfessionalCollection
    .filter((item) =>
      activeSector.value
        ? item.seoProvider.sectorExperience.includes(activeSector.value)
        : true
    )
    .sort((left, right) => {
      if (left.seoProvider.isFeatured !== right.seoProvider.isFeatured) {
        return left.seoProvider.isFeatured ? -1 : 1
      }

      return left.user.display_name.localeCompare(right.user.display_name)
    })
)
</script>
