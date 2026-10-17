<template>
  <UPageHeader
    title="Bon Appétit"
    :ui="{
      root: 'border-0 pt-2 pb-2 sm:pt-4 sm:pb-4',
      title: 'directory-title',
    }"
  >
    <template #links><slot /></template>
  </UPageHeader>
</template>

<style scoped>
:deep(.directory-title) {
  font-size: clamp(3rem, 7vw, 6rem);
  font-weight: 600;
  letter-spacing: -0.065em;
  line-height: 1;
}
</style>
