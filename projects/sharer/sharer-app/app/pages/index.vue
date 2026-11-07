<template>
  <UContainer>
    <div class="pagebody">
      <UBadge color="primary" variant="subtle">Sharer</UBadge>
      <div class="pagebody">
        <h1 class="fx-type-page-title">Your links, ready to share.</h1>
        <p class="fx-type-description">
          Save your social and contact links. Open one screen when somebody
          wants to follow you, then show your profile QR or one direct link.
        </p>
      </div>
      <div class="fx-card__actions">
        <UButton :to="kjordiUrl" size="lg"> Try it with Kjordy </UButton>
        <UButton size="lg" variant="outline" disabled
          >Create yours soon</UButton
        >
      </div>
      <p class="fx-type-caption">
        Free Shares carry Sharer branding. Businesses can get their own branded,
        installable App.
      </p>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const requestUrl = useRequestURL({
  xForwardedHost: true,
  xForwardedProto: true,
})
const kjordiUrl = ['localhost', '127.0.0.1', '::1'].includes(
  requestUrl.hostname
)
  ? 'http://localhost:3034'
  : 'https://kjordi.web.app'
</script>
