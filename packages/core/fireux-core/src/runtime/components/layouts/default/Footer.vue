<!-- COMMENT: app/components/layouts/default/Footer.vue -->
<template>
  <UFooter>
    <UContainer>
      <div class="flex w-full flex-col items-center gap-6">
        <ClientOnly>
          <LayoutsDefaultFooterAdmins class="w-full max-w-4xl" />
        </ClientOnly>

        <div class="flex flex-col items-center gap-4 text-center">
          <AppBrandWordmark
            size="medium"
            light-src="/img/app/wordmark-light.svg"
            dark-src="/img/app/wordmark-dark.png"
          />
          <div class="text-sm text-gray-600 flex flex-col items-center gap-1">
            <a
              href="https://fireux.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FireUX"
              class="flex flex-col items-center gap-1"
            >
              <img src="/img/core/brand/logo.png" alt="FireUX logo" class="h-4 w-4" />
              <AppBrandWordmark
                size="small"
                light-src="/img/core/brand/wordmark-light.svg"
                dark-src="/img/core/brand/wordmark-dark.png"
              />
            </a>
            <span>FIReUX &copy; {{ new Date().getFullYear() }}</span>
            <span>All rights reserved.</span>
          </div>
        </div>
      </div>
    </UContainer>
  </UFooter>
</template>

<script setup lang="ts">
// Footer uses UFooter + UContainer from Nuxt UI 4
</script>
