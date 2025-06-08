<!-- COMMENT: app/components/landing/Fuel.vue -->
<template>
  <ClientOnly>
    <section class="section">
      <FireLogoFlame size="small" />
      <div class="grid-layout">
        <div v-for="(logo, key) in logos" :key="key" class="fuel-item">
          <img :src="isDark ? logo.dark : logo.light" :alt="key + ' Logo'" />
        </div>
      </div>
    </section>
  </ClientOnly>
</template>

<script setup>
const colorMode = useColorMode()

// ✅ Ensure correct initial state (Runs only on the client)
const isDark = computed(() => colorMode.value === 'dark')

const logos = {
  nuxt: {
    light: '/img/nuxt-black.png',
    dark: '/img/nuxt-white.png',
  },
  firebase: {
    light: '/img/firebase-black.png',
    dark: '/img/firebase-white.png',
  },
  stripe: {
    light: '/img/stripe-black.png',
    dark: '/img/stripe-white.png',
  },
}
</script>

<style scoped>
/* ✅ Center the section */
.centered-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

/* ✅ Default: Mobile-First Column Layout */
.grid-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  width: 100%;
  max-width: 300px; /* Keeps it centered on mobile */
}

/* ✅ Fuel Item */
.fuel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background-color: var(--ui-bg);
  transition:
    transform 0.3s ease-out,
    box-shadow 0.3s ease-in-out;
}

/* ✅ Fuel Item Image */
.fuel-item img {
  max-width: 100px;
  filter: grayscale(50%);
  transition:
    filter 0.3s ease-out,
    transform 0.3s ease-in-out;
}

.fuel-item:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.fuel-item:hover img {
  filter: grayscale(0%);
}

/* ✅ Desktop: Switch to Row Layout */
@media (min-width: 768px) {
  .grid-layout {
    flex-direction: row;
    justify-content: center;
    max-width: 100%;
  }
}

/* ✅ Placeholder while loading */
.loading-placeholder {
  height: 100px;
  width: 100%;
}
</style>
