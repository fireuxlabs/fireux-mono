<template>
  <UContainer>
    <UPageSection class="py-16 lg:py-24">
      <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
        <slot name="left" />
        <slot name="right" />
      </div>
    </UPageSection>
  </UContainer>
</template>
