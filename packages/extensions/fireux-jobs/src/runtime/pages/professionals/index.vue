<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <ProfessionalCTA />
      <ClientOnly>
        <ProfessionalCollectionManager :collection="collection" />
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useProfessionalFetch } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalFetch'

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
  'Manage your profile and browse professionals.'

useHead({ title: `${appName} | ${pageTitle}` })

const { coreProfessionals, appProfessionals } = useProfessionalFetch()
const collection = computed(() => [
  ...(appProfessionals?.value ?? []),
  ...(coreProfessionals.value ?? []),
])

</script>
