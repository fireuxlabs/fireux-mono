<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsProfilesChefCTA />
      <OrganismsProfilesChefCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useChefCollection } from '../../composables/fireux/firestore/profiles/Chef/main/useChefCollection'

definePageMeta({
  nav: {
    key: 'chefs',
    label: 'Chefs',
    icon: 'i-lucide-egg-fried',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Chefs',
  description: 'Chef profiles resolved for this runtime.',
  layout: 'default',
  name: 'ChefsIndexPage',
})

const pageTitle = 'Chefs'
const pageDescription =
  'Inspect your chef profile and browse all chefs resolved for this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { globalChefs, localChefs } = useChefCollection()
const collection = computed(() => [
  ...(localChefs?.value ?? []),
  ...(globalChefs.value ?? []),
])

</script>
