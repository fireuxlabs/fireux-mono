<template>
  <TemplateOnePage v-if="projection" :projection="projection" />
</template>

<script setup lang="ts">
import TemplateOnePage from 'fireux-misebox/runtime/TemplateOnePage.vue'
import {
  createTemplateOneFixtureProjection,
  findLandingTemplateBrand,
} from 'fireux-misebox/runtime/template-one-fixtures'
import type { MenuDetailPayload } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'
import type { KitchenFlagshipDishResult } from 'fireux-kitchens/runtime/server/dish/flagship-projection'

const kitchen = findLandingTemplateBrand('friiites')!
const [{ data: menuResult }, { data: flagshipResult }] = await Promise.all([
  useFetch<MenuDetailPayload>('/api/menus/friiites'),
  useFetch<KitchenFlagshipDishResult>('/api/kitchens/5dGJgdjDv7Zi0tjva61O/flagship-dish', {
    query: { appId: 'friiites' },
  }),
])
const projection = computed(() => {
  if (menuResult.value?.kind !== 'manifest') return null
  return createTemplateOneFixtureProjection({
    kitchen,
    flagshipDish: flagshipResult.value?.dish || null,
    menu: {
      menu: menuResult.value.manifest.content,
      specials: menuResult.value.manifest.specials,
      menuHref: '/menus',
      menuActionLabel: 'Browse menu',
    },
    media: path => `/img/app/${path}`,
  })
})

definePageMeta({
  layout: 'templates',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Friiites · Hand-cut, brined and triple-fried',
  description:
    'A fries place developed in Switzerland. Hand-cut, brined and triple-fried in beef tallow.',
})
</script>
