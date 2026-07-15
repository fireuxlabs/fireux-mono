<template>
  <div class="contents">
    <MiseboxMenuClose
      class="fixed right-4 top-4 z-50 sm:right-8 sm:top-8"
      to="/"
    />

    <MenuDetail
      menu-id="pizza-snacks-drinks"
      kitchen-slug="baeren-ringgenberg"
      :menu-context="menuContext"
    />
  </div>
</template>

<script setup lang="ts">
import { normalizeMenuRouteContext } from 'fireux-kitchens/runtime/utils/menu-context'

const route = useRoute()
const menuContext = computed(() =>
  normalizeMenuRouteContext(route.query.context),
)

definePageMeta({
  layout: 'menu',
  nav: {
    key: 'menu',
    label: 'Menu',
    icon: 'i-lucide-utensils',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
</script>
