<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <FireLayoutsHeader
        :menu-bar-links="routes.menuBarLinks"
        :mobile-links="routes.mobileLinks"
      />
      <NuxtPage />
      <FireLayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  routes: {
    type: Object,
    default: () => ({}),
  },
})

const routes = computed(() => props.routes)

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
