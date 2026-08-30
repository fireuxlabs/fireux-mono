<template>
  <UPage><UPageBody>
    <MenuHero />
    <MenuCreate />
    <MenuCollection :menus="menus" />
    <CollectionPagination :has-more="hasMore" :loading="loadingMore" @load-more="loadMore" />
  </UPageBody></UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useMenuCollection } from '../../menu/composables/useMenuCollection'

definePageMeta({
  tag: 'menus', name: 'MenusIndexPage', title: 'Menus', description: 'Browse live menus.', layout: 'default',
  nav: { key: 'menus', label: 'Menus', icon: 'i-lucide-book-open-check', order: 56, desktop: false, mobile: false, layouts: ['default'] },
})
const { appName } = useFireUXConfig()
const { collection: menus, hasMore, loadingMore, loadMore } = useMenuCollection()
useSeo({ title: `${appName} | Menus`, description: 'Browse live kitchen menus.', path: '/menus' })
</script>
