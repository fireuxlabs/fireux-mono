<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsDefaultHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <NuxtPage />
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLink } from '../types/routeLink'
import { useCoreRoutes } from '../composables/app/routes/useCoreRoutes'

// Accept external routes (from tenants/apps) but fall back to core-computed links
const props = defineProps<{
  routes?: {
    menuBarLinks: RouteLink[]
    mobileLinks: RouteLink[]
  }
}>()

const { links } = useCoreRoutes()

const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const defaultMenuBarLinks = computed(() =>
  links.value.filter((r) => KEEP_MENU.has(r.id))
)
const defaultMobileLinks = computed(() =>
  links.value.filter((r) => KEEP_MOBILE.has(r.id))
)

const menuBarLinks = computed<RouteLink[]>(() =>
  props.routes?.menuBarLinks ?? defaultMenuBarLinks.value
)
const mobileLinks = computed<RouteLink[]>(() =>
  props.routes?.mobileLinks ?? defaultMobileLinks.value
)
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}
.layout-wrapper > * {
  align-self: stretch;
}
</style>
