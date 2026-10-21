<template>
  <PackageLibrary
    app-name="Misebox"
    :packages="appPackages"
    :selected="selected"
    :examples="examples"
    :component-links="componentLinks"
  />
</template>
<script setup lang="ts">
import PackageLibrary from 'fireux-core/runtime/app/components/Packages.vue'
import { appPackages } from '../../../utils/package-library'
const route = useRoute<'packages-package'>()
const selected = computed(() => String(route.params.package || ''))
const examples = computed(() =>
  selected.value === 'fireux-kitchens'
    ? [
        {
          title: 'Ordering Ticket',
          description: 'An empty order ticket.',
          to: '/packages/fireux-kitchens/ordering/ticket',
        },
      ]
    : []
)
const componentLinks = {
  KitchenOrdersTicket: '/packages/fireux-kitchens/ordering/ticket',
}
definePageMeta({
  layout: 'default',
  nav: { hidden: true },
  validate: (route) =>
    route.name === 'packages-package' &&
    appPackages.some(
      (entry) => entry.name === String(route.params.package || '')
    ),
})
useSeoMeta({
  title: () => `${selected.value} · Misebox`,
  robots: 'noindex, nofollow',
})
</script>
