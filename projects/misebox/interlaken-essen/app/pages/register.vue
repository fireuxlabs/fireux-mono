<template>
  <section class="market-page market-register" aria-labelledby="register-title">
    <div class="market-register__content">
      <div class="market-register__intro">
        <p class="market-eyebrow">Interlaken Essen</p>
        <h1 id="register-title">Registriere</h1>
        <p class="market-intro">
          Es Konto für alles: choufe, verchoufe oder eifach mal luege.
        </p>
      </div>

      <AuthSystem />
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'marketplace',
})

useSeoMeta({
  title: 'Registriere – Interlaken Essen',
  description:
    'Erstell dis gratis Misebox-Konto für Interlaken Essen.',
})
</script>
