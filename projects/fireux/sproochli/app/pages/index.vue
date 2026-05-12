<template>
  <main class="sproochli-home">
    <section class="sproochli-hero">
      <div class="sproochli-hero__copy">
        <p class="sproochli-kicker">FireUX standalone app</p>
        <h1>Sproochli</h1>
        <p class="sproochli-hero__sentence">
          Multilingual QR pages for real-world places.
        </p>
        <div class="sproochli-actions">
          <UButton to="/info/bern-bike-rental/rental-instructions" icon="i-lucide-qr-code">
            View sample page
          </UButton>
          <UButton to="/console/info" variant="soft" icon="i-lucide-panels-top-left">
            Open console
          </UButton>
        </div>
      </div>

      <aside class="sproochli-ticket" aria-label="Example QR page preview">
        <div class="sproochli-ticket__qr">
          <Icon name="i-lucide-languages" />
        </div>
        <div>
          <p class="sproochli-ticket__place">Bern Bike Rental</p>
          <p class="sproochli-ticket__title">Bike Rental Instructions</p>
          <p class="sproochli-ticket__langs">EN · DE · FR · IT · AR</p>
        </div>
      </aside>
    </section>

    <section class="sproochli-examples" aria-labelledby="examples-title">
      <div>
        <p class="sproochli-kicker">Examples</p>
        <h2 id="examples-title">Simple public pages visitors can actually use</h2>
      </div>
      <div class="sproochli-example-grid">
        <article v-for="example in examples" :key="example.title" class="sproochli-example">
          <Icon :name="example.icon" />
          <h3>{{ example.title }}</h3>
          <p>{{ example.copy }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
  },
})

useSeoMeta({
  title: 'Sproochli - Multilingual QR pages for real-world places',
  description:
    'Create simple public QR information pages in multiple languages for bike rentals, guest info, house rules, safety notes, and visitor guides.',
})

const examples = [
  {
    title: 'Bike rentals',
    copy: 'Pickup steps, safety notes, return instructions, and emergency contacts at the scan point.',
    icon: 'i-lucide-bike',
  },
  {
    title: 'Guest info',
    copy: 'Wi-Fi, check-in, checkout, house rules, and visitor notes without a heavy portal.',
    icon: 'i-lucide-house',
  },
  {
    title: 'House rules',
    copy: 'Short, approved multilingual guidance for shared spaces, venues, and notices.',
    icon: 'i-lucide-clipboard-check',
  },
]
</script>

<style scoped>
.sproochli-home {
  min-height: 100vh;
  background: #f7faf7;
  color: #17201b;
}

.sproochli-hero {
  display: grid;
  gap: 2rem;
  align-items: center;
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 4rem 0 2rem;
}

.sproochli-hero__copy {
  max-width: 720px;
}

.sproochli-kicker {
  margin: 0 0 0.75rem;
  color: #12715a;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(3rem, 10vw, 6.5rem);
  line-height: 0.92;
  letter-spacing: 0;
}

h2 {
  max-width: 680px;
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1;
  letter-spacing: 0;
}

.sproochli-hero__sentence {
  max-width: 560px;
  margin: 1.25rem 0 0;
  color: #3a4a40;
  font-size: 1.25rem;
  line-height: 1.6;
}

.sproochli-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.sproochli-ticket {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: center;
  max-width: 520px;
  padding: 1rem;
  border: 1px solid #d8e3dc;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgb(23 32 27 / 10%);
}

.sproochli-ticket__qr {
  display: grid;
  place-items: center;
  width: 5rem;
  aspect-ratio: 1;
  border-radius: 6px;
  background:
    linear-gradient(90deg, #17201b 10px, transparent 10px) 0 0 / 20px 20px,
    linear-gradient(#17201b 10px, transparent 10px) 0 0 / 20px 20px,
    #eef8f2;
  color: #12715a;
  font-size: 2rem;
}

.sproochli-ticket__place,
.sproochli-ticket__title,
.sproochli-ticket__langs {
  margin: 0;
}

.sproochli-ticket__place {
  color: #536157;
  font-size: 0.9rem;
}

.sproochli-ticket__title {
  margin-top: 0.15rem;
  font-size: 1.25rem;
  font-weight: 800;
}

.sproochli-ticket__langs {
  margin-top: 0.35rem;
  color: #12715a;
  font-size: 0.86rem;
  font-weight: 700;
}

.sproochli-examples {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 3rem 0 4rem;
}

.sproochli-example-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.sproochli-example {
  min-height: 13rem;
  padding: 1.25rem;
  border: 1px solid #d8e3dc;
  border-radius: 8px;
  background: #ffffff;
}

.sproochli-example :deep(svg) {
  width: 1.75rem;
  height: 1.75rem;
  color: #12715a;
}

.sproochli-example h3 {
  margin: 1.5rem 0 0.5rem;
  font-size: 1.25rem;
}

.sproochli-example p {
  margin: 0;
  color: #4d5c52;
  line-height: 1.6;
}

@media (min-width: 800px) {
  .sproochli-hero {
    grid-template-columns: minmax(0, 1fr) 420px;
    min-height: 72vh;
  }

  .sproochli-example-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
