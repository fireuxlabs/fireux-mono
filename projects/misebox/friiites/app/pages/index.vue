<template>
  <TemplateOnePage v-if="projection" :projection="projection" />
</template>

<script setup lang="ts">
import { useLiveFetch } from 'fireux-core/runtime/composables/fireux/firestore/useLiveFetch'
import TemplateOnePage from 'fireux-misebox/runtime/components/TemplateOne/Page.vue'
import {
  createTemplateOneFixtureProjection,
  findLandingTemplateBrand,
} from 'fireux-misebox/runtime/content/template-one-fixtures'
import type { MenuDetailPayload } from 'fireux-kitchens/runtime/menu/models/menu-detail.model'
import type { KitchenFlagshipDishResult } from 'fireux-kitchens/runtime/kitchen/server/operations/dishes/flagship-projection'

const kitchen = findLandingTemplateBrand('friiites')!
const [{ data: menuResult }, { data: flagshipResult }] = await Promise.all([
  useLiveFetch<MenuDetailPayload>('/api/menus/friiites'),
  useLiveFetch<KitchenFlagshipDishResult>(
    '/api/kitchens/5dGJgdjDv7Zi0tjva61O/flagship-dish',
    {
      query: { appId: 'friiites' },
    }
  ),
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
    media: (path) => `/img/app/${path}`,
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
