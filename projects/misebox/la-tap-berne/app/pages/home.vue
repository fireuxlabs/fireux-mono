<template>
  <LaTapBernePageSurface
    title="Spanish plates in Matten bei Interlaken."
    subtitle="La Tap Berne is a relaxed pub for tapas, Comida Casera, and easy drinks just off the Interlaken rhythm."
  >
    <div class="latap-page-copy">
      <p>
        Come for Iberian small plates, tortilla, bravas, pimientos, ribs,
        and the kind of food that turns a quick drink into something more.
      </p>
    </div>

  </LaTapBernePageSurface>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'latap-default',
})

useSeoMeta({
  title: 'La Tap Berne | Home',
  description:
    'Spanish-style plates, tapas, drinks, and terrace moments at La Tap Berne in Matten bei Interlaken.',
})
</script>
