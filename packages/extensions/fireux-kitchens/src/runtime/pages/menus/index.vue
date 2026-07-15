<template>
  <!-- Index map: docs/concepts/family-public-index.md · family: Menu index -->
  <MenuIndex />
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'menus',
  nav: {
    key: 'menus',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  layout: 'default',
  name: 'MenusIndexPage',
  title: 'Menus',
  description: 'Browse live Misebox kitchen menus and order where online ordering is available.',
})

const pageTitle = 'Menus'
const { appName } = useFireUXConfig()

useHead({ title: `${appName} | ${pageTitle}` })
</script>
