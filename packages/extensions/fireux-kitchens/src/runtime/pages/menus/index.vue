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
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Menus',
  description: 'Browse root menus.',
  layout: 'default',
  name: 'MenusIndexPage',
  index: false,
  sitemap: false,
})

const pageTitle = 'Menus'
const pageDescription = 'Root menu index for the current runtime.'
const { menus: collection } = useMenuCollection(undefined, {
  shape: 'root',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

useSeoMeta({
  title: 'Menus',
  description: pageDescription,
  robots: 'noindex, nofollow',
})
</script>
