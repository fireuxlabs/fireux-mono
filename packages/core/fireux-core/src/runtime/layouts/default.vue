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

// Merge core routes with additional routes passed via props
const menuBarLinks = [...coreMenuBarLinks, ...(props.routes.menuBarLinks || [])]
const mobileLinks = [...coreMobileLinks, ...(props.routes.mobileLinks || [])]

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
