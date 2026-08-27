<template>
  <UContainer class="py-16 sm:py-24">
    <div class="mx-auto max-w-2xl space-y-8 text-center">
      <UBadge color="primary" variant="subtle">Sharer</UBadge>
      <div class="space-y-4">
        <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
          Your links, ready to share.
        </h1>
        <p class="mx-auto max-w-xl text-lg text-muted">
          Save your social and contact links. Open one screen when somebody
          wants to follow you, then show your profile QR or one direct link.
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-3">
        <UButton :to="kjordiUrl" size="lg">
          Try it with Kjordy
        </UButton>
        <UButton size="lg" variant="outline" disabled>Create yours soon</UButton>
      </div>
      <p class="text-sm text-muted">
        Free Shares carry Sharer branding. Premium businesses get their own
        branded, installable PWA.
      </p>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const requestUrl = useRequestURL()
const kjordiUrl = ['localhost', '127.0.0.1', '::1'].includes(requestUrl.hostname)
  ? 'http://localhost:3034'
  : 'https://kjordi.web.app'
</script>
