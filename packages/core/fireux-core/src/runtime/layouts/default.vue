<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsHeader
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
import { useCoreRoutes } from 'fireux-core/runtime/composables/app/routes/useCoreRoutes'

const props = defineProps<{
  routes?: import('../types/layouts').LayoutRoutes
}>()

const { links } = useCoreRoutes()

const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
// Mobile should drop “home” but keep others + groups
const KEEP_MOBILE = new Set(['products', 'blog', 'users', 'user', 'admin'])

// Base core links
const baseMenu = computed(() =>
  links.value.filter((r: any) => KEEP_MENU.has(r.id))
)
const baseMobile = computed(() =>
  links.value.filter((r: any) => KEEP_MOBILE.has(r.id))
)

// Merge with optional tenant-provided additions
const input = computed(() => props.routes ?? {})
const menuBarLinks = computed(() => [
  ...baseMenu.value,
  ...((input.value as any).menuBarLinks ?? []),
])
const mobileLinks = computed(() => [
  ...baseMobile.value,
  ...((input.value as any).mobileLinks ?? []),
])

defineOptions({ name: 'CoreDefault' })
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
