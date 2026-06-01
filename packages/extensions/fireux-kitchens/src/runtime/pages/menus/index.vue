<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody">
      <MenuCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useMenuCollection } from '../../composables/fireux/firestore/menu/fetch/useMenuCollection'

definePageMeta({
  tag: 'menus',
  nav: {
    key: 'menus',
    label: 'Menus',
    icon: 'i-lucide-book-open',
    order: 56,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Menus',
  description: 'Browse menus.',
  layout: 'default',
  name: 'MenusIndexPage',
})

const pageTitle = 'Menus'
const pageDescription = 'Browse menus.'
const { menus: collection } = useMenuCollection()

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

useSeoMeta({
  title: 'Menus',
  description: pageDescription,
})
</script>
