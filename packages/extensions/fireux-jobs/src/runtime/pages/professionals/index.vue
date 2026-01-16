<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsProfilesProfessionalCTA />
      <OrganismsProfilesProfessionalCollectionManager :cards="cards" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useProfessionalCollection } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection'
import { useProfessional } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'
import type { ProfessionalCore } from '../../models/profiles/Professional/Professional.model'

definePageMeta({
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-briefcase',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Professionals',
  description: 'Professional profiles resolved for this runtime.',
  layout: 'default',
  name: 'ProfessionalsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Professionals'
const pageDescription =
  'Inspect the current professional and browse all professionals available to this runtime.'

useHead({ title: `${appName} | ${pageTitle}` })

const { globalProfessionals, localProfessionals } = useProfessionalCollection()
const { card: makeCard } = useProfessional()

const cards = computed(() => {
  const globalCards = (globalProfessionals.value ?? [])
    .map((entry) => makeCard(entry as ProfessionalCore, (entry as any)?.user ?? null))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  const localCards = (localProfessionals?.value ?? [])
    .map((entry) => makeCard(entry as ProfessionalCore, (entry as any)?.user ?? null))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  return [...localCards, ...globalCards]
})

</script>
