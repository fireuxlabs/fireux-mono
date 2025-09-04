<template>
  <div class="layout-wrapper">
    <DevNav :links="safeDevRoutes.miseboxDevRoutes || []" />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Vue's computed is auto-imported by Nuxt; declare for TS
declare const computed: <T>(getter: () => T) => import('vue').ComputedRef<T>
const props = defineProps<{
  devRoutes?: import('../types/layouts').DevRoutes
}>()
const safeDevRoutes = computed(
  () => props.devRoutes ?? ({} as import('../types/layouts').DevRoutes)
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
