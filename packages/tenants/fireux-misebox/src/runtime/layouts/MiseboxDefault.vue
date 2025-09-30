<template>
  <CoreDefault :links="links" :menu-ids="TENANT_MENU_IDS" :mobile-ids="TENANT_MOBILE_IDS" />
</template>

<script setup lang="ts">
import { useMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { links } = useMiseboxRoutes()

const TENANT_MENU_IDS = [
  'chefs',
  'suppliers',
  'kitchens',
  'recipes',
  'jobs',
  'employers',
  'professionals',
]

const TENANT_MOBILE_IDS = [
  ...TENANT_MENU_IDS,
  'chef-profile',
  'supplier-profile',
  'employer-profile',
  'professional-profile',
]
</script>