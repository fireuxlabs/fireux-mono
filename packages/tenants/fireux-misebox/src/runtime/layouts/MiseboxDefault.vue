<template>
  <CoreDefault :routes="miseboxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLink } from '../composables/app/routes/useMiseboxRoutes'
import { useMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { links } = useMiseboxRoutes()

const KEEP_MENU = new Set<RouteLink['id']>([
  'chefs',
  'suppliers',
  'kitchens',
  'recipes',
  'jobs',
  'employers',
  'professionals',
])

const KEEP_MOBILE = new Set<RouteLink['id']>([
  ...KEEP_MENU,
  'chef-profile',
  'supplier-profile',
  'employer-profile',
  'professional-profile',
])

const miseboxRoutes = computed(() => ({
  menuBarLinks: links.filter((r) => KEEP_MENU.has(r.id)),
  mobileLinks: links.filter((r) => KEEP_MOBILE.has(r.id)),
}))
</script>
