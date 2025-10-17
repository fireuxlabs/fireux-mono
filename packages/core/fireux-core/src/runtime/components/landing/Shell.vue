<template>
  <UContainer>
    <UPageSection class="py-0">
      <div class="grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
        <slot name="left" />
        <slot name="right" />
      </div>
    </UPageSection>
  </UContainer>
</template>
