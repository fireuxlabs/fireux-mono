<template>
  <div class="brand-landing">
    <EffectsStars />

    <section class="brand-card" aria-labelledby="richies-brand">
      <img
        class="brand-avatar"
        src="/img/app/logo.png"
        alt="Richies Reinigung logo"
        width="120"
        height="120"
      />

      <img
        class="brand-wordmark"
        src="/img/app/wordmark-light.png"
        srcset="/img/app/wordmark-light.png 1x, /img/app/wordmark-light-2x.png 2x"
        alt="Richies Reinigung wordmark"
        width="320"
        height="80"
      />

      <p id="richies-brand" class="lede">
        Richie’s Reinigung provides reliable, professional cleaning services for homes and businesses in Interlaken, Lauterbrunnen, and Wengen.
      </p>

      <div class="cta-actions">
        <NuxtLink class="btn primary" to="mailto:hello@richiesreinigung.ch">
          Hire Richie
        </NuxtLink>
        <NuxtLink class="btn outline" to="tel:+41789520500">
          <Icon name="i-lucide-phone" class="w-5 h-5" />
          +41 78 952 05 00
        </NuxtLink>
      </div>
    </section>
  </div>
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
  title: 'Richies Reinigung — Freelance cleaning partner',
  description:
    'Independent Zürich cleaner for recurring apartments, offices, and pop-up projects. Upcoming availability and contact info.',
})
</script>

<style scoped>
.brand-landing {
  position: relative;
  min-height: 100%;
  padding: calc(var(--spacing) * 16) clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 20));
}

.brand-card {
  width: min(640px, 100%);
  margin: 0 auto;
  padding: clamp(calc(var(--spacing) * 8), 4vw, calc(var(--spacing) * 14));
  border-radius: calc(var(--ui-radius) * 6);
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.7);
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.7);
  text-align: center;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
}

.brand-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.4);
  margin: 0 auto;
  background: #0f172a;
}

.brand-wordmark {
  width: min(360px, 80vw);
  margin: 0 auto;
  display: block;
}

.lede {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: rgba(248, 250, 252, 0.9);
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 3);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.8rem;
  border-radius: 9999px;
  font-weight: var(--font-weight-semibold);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn.primary {
  background: #2563eb;
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.35);
}

.btn.primary:hover {
  background: #3b82f6;
}

.btn.outline {
  background: transparent;
  border-color: rgba(226, 232, 240, 0.4);
  color: #e2e8f0;
}

.btn.outline:hover {
  border-color: rgba(255, 255, 255, 0.7);
  color: white;
}

@media (max-width: 640px) {
  .brand-wordmark {
    width: min(260px, 90vw);
  }
}
</style>

<style global>
body {
  background: radial-gradient(
      circle at top,
      rgba(37, 99, 235, 0.35),
      transparent 55%
    ),
    linear-gradient(135deg, #020617, #0f172a 60%, #1e1b4b);
}
</style>
