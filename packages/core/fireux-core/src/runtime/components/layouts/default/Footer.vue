<!-- COMMENT: app/components/layouts/default/Footer.vue -->
<template>
  <UFooter>
    <UContainer>
      <div class="flex w-full flex-col items-center gap-6">
        <div class="flex flex-col items-center gap-4 text-center">
          <LogoBrand />
          <p class="text-sm text-gray-600">
            &copy; {{ new Date().getFullYear() }} FIReUX. All rights reserved.
          </p>
        </div>

        <LayoutsDefaultFooterAdmins class="w-full max-w-4xl" />
      </div>
    </UContainer>
  </UFooter>
</template>

<script setup>
// Footer uses UFooter + UContainer from Nuxt UI 4
</script>
