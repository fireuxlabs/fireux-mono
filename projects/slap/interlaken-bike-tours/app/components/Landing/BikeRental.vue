<template>
  <section id="rental" class="rental-section section">
    <div class="rental-inner wrap">
      <div>
        <p class="eyebrow">03 / Bike rental</p>
        <h2>Find your bike.</h2>
      </div>
      <div class="rental-copy">
        <p>
          Need a bike for your own ride? Tell Ben what you want to ride, your
          size, and where you're headed. He'll help find the right bike through
          trusted local rental partners.
        </p>
        <NuxtLink
          :to="{ path: '/', query: { tour: 'Bike rental' }, hash: '#enquire' }"
          class="text-link"
          >Ask about a rental <span aria-hidden="true">↗</span></NuxtLink
        >
      </div>
    </div>
  </section>
</template>
