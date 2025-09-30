<template>
  <CoreDefault :routes="miseboxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { links } = useMiseboxRoutes()

const KEEP_MENU = new Set<string>([
  'chefs',
  'suppliers',
  'kitchens',
  'recipes',
  'jobs',
  'employers',
  'professionals',
])

const KEEP_MOBILE = new Set<string>([
  ...KEEP_MENU,
  'chef-profile',
  'supplier-profile',
  'employer-profile',
  'professional-profile',
])

const miseboxRoutes = computed(() => ({
  menuBarLinks: links.value.filter((r) => KEEP_MENU.has(r.id)),
  mobileLinks: links.value.filter((r) => KEEP_MOBILE.has(r.id)),
}))
</script>
