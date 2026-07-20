<!-- Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: use the app-owned Find My SEO fixture. -->
<template>
  <UPage>
    <UPageHeader
      title="Browse SEO professionals"
      description="Compare consultants and agencies by specialism, sector fit, reviews, availability, and trust signals."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2>Professionals</h2>
              <p>Browse SEO professionals by sector fit, availability, and trust signals.</p>
            </div>

            <UBadge variant="soft">{{ professionalCards.length }}</UBadge>
          </div>
        </template>

        <div v-if="professionalCards.length" class="space-y-3">
          <ProfessionalCardsCell
            v-for="card in professionalCards"
            :key="card.id"
            v-bind="card"
            link
          />
        </div>

        <p v-else class="text-sm text-dimmed">No professionals found.</p>
      </UCard>

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
import {
  useProfessionalInterface,
  type ProfessionalCard,
} from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import { appMeta } from '../../meta'
import { demoSeoProfessionalCollection } from '../../demo/findMySeo'

const { cell: professionalCell } = useProfessionalInterface()

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
const professionalCards = computed<ProfessionalCard.Card[]>(() =>
  filteredCollection.value
    .map((entry) => professionalCell(entry as any, entry.user))
    .filter((card): card is ProfessionalCard.Card => Boolean(card))
)
</script>
