// fireux-core/src/runtime/layouts/Default.vue (CoreDefault)

<template>
  <div class="layout-wrapper">
    <FireLayoutsHeader
      :menu-bar-links="menuBarLinks"
      :mobile-links="mobileLinks"
    />
    <NuxtPage />
    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup>
import { getCoreRoutes } from '../composables/app/routes/useCoreRoutes'

const props = defineProps({
  routes: {
    type: Object, // Expecting an object-based structure
    default: () => ({
      menuBarLinks: [],
      mobileLinks: [],
    }),
  },
})

const { menuBarLinks: coreMenuBarLinks, mobileLinks: coreMobileLinks } =
  await getCoreRoutes()

console.log('🔥 CoreDefault: Core routes fetched:', {
  coreMenuBarLinks: JSON.stringify(coreMenuBarLinks, null, 2),
  coreMobileLinks: JSON.stringify(coreMobileLinks, null, 2)
})

console.log('🔥 CoreDefault: Props routes received:', JSON.stringify(props.routes, null, 2))

// Merge core routes with additional routes passed via props
const menuBarLinks = [...coreMenuBarLinks, ...(props.routes.menuBarLinks || [])]
const mobileLinks = [...coreMobileLinks, ...(props.routes.mobileLinks || [])]

console.log('🔥 CoreDefault: Final merged routes:', {
  menuBarLinks: JSON.stringify(menuBarLinks, null, 2),
  mobileLinks: JSON.stringify(mobileLinks, null, 2)
})

defineOptions({
  name: 'CoreDefault',
})
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
