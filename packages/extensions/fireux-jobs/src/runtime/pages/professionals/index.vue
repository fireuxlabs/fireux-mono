<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsProfilesProfessionalCTA />
      <ClientOnly>
        <OrganismsProfilesProfessionalCollectionManager :collection="collection" />
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useProfessionalCollection } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection'

definePageMeta({
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-briefcase',
    order: 62,
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
const collection = computed(() => [
  ...(localProfessionals?.value ?? []),
  ...(globalProfessionals.value ?? []),
])

</script>
