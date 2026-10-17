<template>
  <KitchenHome v-if="isWorkspaceHost" />
  <main v-else><LandingPublic /></main>
</template>

<script setup lang="ts">
import { useRequestURL, useSeoMeta } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import KitchenHome from '../components/Workspace/KitchenHome.vue'
import LandingPublic from '../components/Landing/Public.vue'

const isWorkspaceHost =
  useRequestURL().origin === useFireUXConfig().workspaceConfig.kitchen?.origin

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-kitchen',
    label: 'Home',
    group: 'Workspace',
    description: 'Kitchen Workspace',
    icon: 'i-lucide-chef-hat',
    position: 'bottom',
    order: 900,
    prominent: true,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})

if (isWorkspaceHost) {
  useSeoMeta({ title: 'Kitchen Workspace | Misebox', robots: 'noindex, nofollow' })
} else {
  useAppLandingSeo({
    title: 'Kitchens and Menus | Misebox',
    description: 'Find a Kitchen and view its Menus.',
    path: '/',
    image: '/img/app/cover.png',
    logo: '/img/app/logo.png',
    language: 'en',
  })
}
</script>
