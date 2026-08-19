<template>
  <MenuIndex :index="menuIndex" />
</template>

<script setup lang="ts">
import { navigateTo, setResponseStatus, useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useMenuCollection } from '../../menu/composables/useMenuCollection'

definePageMeta({
  tag: 'menus',
  name: 'MenusIndexPage',
  title: 'Menus',
  description: 'Browse live menus.',
  layout: 'default',
  nav: {
    key: 'menus',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
})

const { appName } = useFireUXConfig()
const menuIndex = useMenuCollection()

await menuIndex.ready
if (import.meta.server && menuIndex.statusCode.value) {
  setResponseStatus(menuIndex.statusCode.value)
}

const outcome = menuIndex.outcome.value
if (outcome.kind === 'redirect' && outcome.path) {
  await navigateTo(outcome.path, {
    redirectCode: 302,
    replace: true,
  })
}

useHead({ title: `${appName} | Menus` })
</script>
