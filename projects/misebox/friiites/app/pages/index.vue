<template>
  <UPage class="friiites-page">
    <main>
      <section class="friiites-hero">
        <div class="friiites-copy">
          <p class="friiites-kicker">Developed in Switzerland</p>
          <h1>Friiites</h1>
          <p class="friiites-lede">
            Hand-cut. Brined. Triple-fried in beef tallow.
          </p>
          <p class="friiites-intro">
            A simple fries place built around one product and a precise kitchen
            method.
          </p>

          <UButton
            to="#method"
            size="xl"
            color="primary"
            trailing-icon="i-lucide-arrow-down"
          >
            See the method
          </UButton>
        </div>

        <div class="friiites-carton" aria-label="A carton of Friiites">
          <span v-for="index in 11" :key="index" class="friiites-fry" />
          <div class="friiites-pack">
            <img src="/img/app/wordmark-light.svg" alt="Friiites" />
          </div>
        </div>
      </section>

      <section id="method" class="friiites-method" aria-labelledby="method-title">
        <header>
          <p class="friiites-kicker">The method</p>
          <h2 id="method-title">Three stages. One proper portion of fries.</h2>
        </header>

        <ol>
          <li>
            <span>01</span>
            <strong>Hand-cut</strong>
            <p>Potatoes are cut by hand for the batch.</p>
          </li>
          <li>
            <span>02</span>
            <strong>Brined</strong>
            <p>The cut fries are brined before cooking.</p>
          </li>
          <li>
            <span>03</span>
            <strong>Triple-fried</strong>
            <p>Three cooks in beef tallow build the finished fry.</p>
          </li>
        </ol>
      </section>

      <section class="friiites-system">
        <div>
          <p class="friiites-kicker">Built with Misebox</p>
          <h2>A simple product needs a repeatable operation.</h2>
        </div>
        <p>
          Misebox connects recipes, preparation, menus, service, and orders for
          each Friiites location.
        </p>
      </section>
    </main>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Friiites',
  description:
    'Hand-cut fries, brined and triple-fried in beef tallow. Developed in Switzerland.',
})
</script>
