<template>
  <main class="slap-home">
    <section class="slap-hero" aria-labelledby="slap-home-title">
      <img
        class="slap-hero__image"
        src="/img/app/landing-hero.png"
        alt=""
        aria-hidden="true"
      >

      <div class="slap-hero__shade" />

      <UContainer class="slap-hero__inner">
        <div class="slap-hero__copy">
          <h1 id="slap-home-title">
            Slap
          </h1>
          <p class="slap-hero__tagline">
            Make it hit.
          </p>

          <div class="slap-actions" aria-label="Primary actions">
            <UButton to="/get-started" color="primary" size="xl" icon="i-lucide-zap" class="slap-action slap-action--hot">
              Start
            </UButton>
            <UButton to="/products" color="neutral" variant="soft" size="xl" icon="i-lucide-shopping-bag" class="slap-action slap-action--dark">
              Drops
            </UButton>
          </div>
        </div>
      </UContainer>

      <div class="slap-strip" aria-label="Slap lanes">
        <div class="slap-strip__item">
          <UIcon name="i-lucide-monitor-smartphone" />
          <span>Sites</span>
        </div>
        <div class="slap-strip__item">
          <UIcon name="i-lucide-package-open" />
          <span>Drops</span>
        </div>
        <div class="slap-strip__item">
          <UIcon name="i-lucide-newspaper" />
          <span>Stories</span>
        </div>
      </div>
    </section>

    <section class="slap-pulse" aria-label="Slap rhythm">
      <span />
      <strong>Brand</strong>
      <span />
      <strong>Drop</strong>
      <span />
      <strong>Scene</strong>
      <span />
    </section>
  </main>
</template>

<script setup lang="ts">
import { appMeta } from '../meta'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-house',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
})
</script>

<style scoped>
.slap-home {
  overflow: clip;
  background: #f9f6ee;
  color: #0b0b0d;
}

.slap-hero {
  position: relative;
  min-height: min(760px, calc(100svh - 16px));
  isolation: isolate;
  display: grid;
  align-items: center;
  border-bottom: 6px solid #0b0b0d;
}

.slap-hero__image {
  position: absolute;
  inset: 0;
  z-index: -3;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 65% center;
}

.slap-hero__shade {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(90deg, rgb(249 246 238 / 0.92) 0%, rgb(249 246 238 / 0.64) 30%, rgb(249 246 238 / 0.03) 56%, transparent 100%),
    radial-gradient(circle at 18% 28%, rgb(255 234 51 / 0.28), transparent 26%),
    linear-gradient(180deg, transparent 76%, rgb(249 246 238 / 0.7) 100%);
}

.slap-hero__inner {
  width: 100%;
  padding-block: 7rem 8.75rem;
}

.slap-hero__copy {
  max-width: 35rem;
}

.slap-hero h1 {
  margin: 0;
  color: #0b0b0d;
  font-size: clamp(5.2rem, 7.8rem, 7.8rem);
  line-height: 0.82;
  font-weight: 950;
}

.slap-hero__tagline {
  margin: 1.2rem 0 0;
  color: #0b0b0d;
  font-size: 2rem;
  line-height: 1;
  font-weight: 900;
}

.slap-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.slap-action {
  border: 2px solid #0b0b0d;
  box-shadow: 5px 5px 0 #0b0b0d;
}

.slap-strip {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 4px solid #0b0b0d;
  background: #0b0b0d;
}

.slap-strip__item {
  min-height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  color: #f9f6ee;
  font-size: 0.95rem;
  font-weight: 900;
  text-transform: uppercase;
}

.slap-strip__item + .slap-strip__item {
  border-left: 2px solid rgb(249 246 238 / 0.25);
}

.slap-strip__item:nth-child(1) {
  background: #00a3bd;
}

.slap-strip__item:nth-child(2) {
  background: #e4146d;
}

.slap-strip__item:nth-child(3) {
  background: #5c2d83;
}

.slap-strip__item :deep(svg) {
  width: 1.4rem;
  height: 1.4rem;
}

.slap-pulse {
  min-height: 12rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  padding: 3rem max(1rem, calc((100vw - 76rem) / 2));
  background: #0b0b0d;
  color: #f9f6ee;
}

.slap-pulse span {
  display: block;
  height: 4px;
  background: #f9f6ee;
}

.slap-pulse strong {
  color: #f9f6ee;
  font-size: 1.25rem;
  line-height: 1;
  font-weight: 950;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .slap-hero {
    min-height: auto;
    align-items: start;
  }

  .slap-hero__image {
    height: 61%;
    object-position: 72% top;
  }

  .slap-hero__shade {
    background:
      linear-gradient(180deg, rgb(249 246 238 / 0.05) 0%, rgb(249 246 238 / 0.55) 43%, #f9f6ee 73%),
      linear-gradient(90deg, rgb(249 246 238 / 0.88), rgb(249 246 238 / 0.04));
  }

  .slap-hero__inner {
    padding-block: 22rem 8.75rem;
  }

  .slap-hero__copy {
    max-width: 100%;
  }

  .slap-hero h1 {
    font-size: 5rem;
  }

  .slap-hero__tagline {
    font-size: 1.55rem;
  }

  .slap-pulse {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.75rem;
  }

  .slap-pulse span {
    width: 4rem;
  }
}

@media (max-width: 560px) {
  .slap-hero h1 {
    font-size: 4.2rem;
  }

  .slap-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .slap-strip__item {
    min-height: 4.25rem;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.72rem;
  }

  .slap-pulse {
    min-height: 11rem;
    padding-block: 2rem;
  }
}
</style>
