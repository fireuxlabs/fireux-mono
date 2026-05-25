<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <ChefCTA />
      <ChefCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useChefFetch } from '../../composables/fireux/firestore/profiles/Chef/fetch/useChefFetch'

definePageMeta({
  tag: 'chefs',
  nav: {
    visibility: { profiles: ['chef'] },
    key: 'chefs',
    label: 'Chefs',
    icon: 'i-lucide-egg-fried',
    order: 40,
     desktop: false,
     mobile: false,
    layouts: ['default'],
  },
  title: 'Chefs',
  description: 'Browse chef profiles.',
  layout: 'default',
  name: 'ChefsIndexPage',
})

const pageTitle = 'Chefs'
const pageDescription =
  'View your profile and browse chefs.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { coreChefs, appChefs } = useChefFetch()
const collection = computed(() => [
  ...(appChefs?.value ?? []),
  ...(coreChefs.value ?? []),
])

</script>
