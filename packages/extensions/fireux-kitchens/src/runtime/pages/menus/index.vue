<template>
  <!-- Index map: docs/concepts/family-public-index.md · family: Menu index -->
  <MenuIndex />
</template>

<script setup lang="ts">
import { setPageLayout, useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'menus',
  middleware: () => {
    const fireux = useFireUXConfig()
    setPageLayout(fireux.isTenant ? 'menu' : 'default')
  },
  nav: {
    key: 'menus',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default', 'menu'],
  },
  name: 'MenusIndexPage',
  title: 'Menus',
  description: 'Browse live Misebox kitchen menus and order where online ordering is available.',
})

const pageTitle = 'Menus'
const fireux = useFireUXConfig()

useHead({ title: `${fireux.appName} | ${pageTitle}` })
</script>
