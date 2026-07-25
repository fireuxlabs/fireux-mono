<!-- Concurrent edit — 2026-07-23 02:43 CEST — Central landing product family: own the reusable product-led index presentation. -->
<template>
  <div
    class="landing-product"
    :class="{ 'landing-product--full-hero': heroLayout === 'proof-wide' }"
  >
    <section
      class="landing-product__hero"
      :class="{ 'landing-product__hero--proof-wide': heroLayout === 'proof-wide' }"
      aria-labelledby="landing-product-title"
    >
      <div class="landing-product__hero-glow" aria-hidden="true" />

      <div class="landing-product__hero-copy">
        <UBadge
          color="primary"
          variant="soft"
          size="lg"
          class="landing-product__hero-badge"
        >
          {{ content.hero.badge }}
        </UBadge>

        <div class="landing-product__hero-heading">
          <p>{{ content.hero.kicker }}</p>
          <h1 id="landing-product-title">
            {{ content.hero.title }}<br>
            <span>{{ content.hero.accent }}</span>
          </h1>
        </div>

        <p class="landing-product__hero-description">
          {{ content.hero.description }}
        </p>

        <div
          v-if="heroMode === 'full'"
          class="landing-product__hero-actions"
        >
          <UButton
            :to="content.hero.primaryAction.to"
            size="xl"
            :trailing-icon="content.hero.primaryAction.icon || 'i-lucide-arrow-right'"
          >
            {{ content.hero.primaryAction.label }}
          </UButton>
          <UButton
            :to="content.hero.secondaryAction.to"
            size="xl"
            color="neutral"
            variant="soft"
            :icon="content.hero.secondaryAction.icon"
          >
            {{ content.hero.secondaryAction.label }}
          </UButton>
        </div>

        <NuxtLink
          v-if="heroMode === 'full' && content.hero.quietAction"
          :to="content.hero.quietAction.to"
          class="landing-product__quiet-link"
        >
          {{ content.hero.quietAction.label }}
          <UIcon
            :name="content.hero.quietAction.icon || 'i-lucide-arrow-up-right'"
            aria-hidden="true"
          />
        </NuxtLink>

        <ul
          v-if="heroMode === 'full'"
          class="landing-product__trust-list"
          aria-label="Product principles"
        >
          <li v-for="item in content.hero.trustItems" :key="item">
            <UIcon name="i-lucide-check" aria-hidden="true" />
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="landing-product__hero-preview">
        <slot name="hero-preview" />
      </div>
    </section>

    <slot name="after-hero" />

    <nav v-reveal class="landing-product__loop" aria-label="Operating loop">
      <NuxtLink
        v-for="(step, index) in content.operatingLoop"
        :key="step.title"
        :to="step.to"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <UIcon :name="step.icon" aria-hidden="true" />
        <div>
          <strong>{{ step.title }}</strong>
          <small>{{ step.copy }}</small>
        </div>
        <UIcon
          v-if="index < content.operatingLoop.length - 1"
          name="i-lucide-arrow-right"
          class="landing-product__loop-arrow"
          aria-hidden="true"
        />
      </NuxtLink>
    </nav>

    <section
      v-reveal
      class="landing-product__section landing-product__system"
      aria-labelledby="landing-product-system-title"
    >
      <div class="landing-product__section-heading">
        <p class="fx-type-headline">{{ content.system.eyebrow }}</p>
        <h2 id="landing-product-system-title">{{ content.system.title }}</h2>
        <p>{{ content.system.description }}</p>
      </div>

      <div class="landing-product__system-grid">
        <article
          v-for="area in content.system.areas"
          :key="area.title"
          :style="area.accent ? { '--landing-product-area-accent': area.accent } : undefined"
        >
          <div class="landing-product__system-icon">
            <UIcon :name="area.icon" aria-hidden="true" />
          </div>
          <p>{{ area.eyebrow }}</p>
          <h3>{{ area.title }}</h3>
          <p>{{ area.copy }}</p>
          <ul>
            <li v-for="item in area.items" :key="item">
              <UIcon name="i-lucide-check" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
          <UButton
            :to="area.to"
            color="neutral"
            variant="link"
            class="landing-product__card-link"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ area.action }}
          </UButton>
        </article>
      </div>
    </section>

    <section
      v-reveal="'left'"
      class="landing-product__showcase"
      aria-labelledby="landing-product-showcase-title"
    >
      <div class="landing-product__showcase-copy">
        <UBadge color="primary" variant="soft">{{ content.showcase.badge }}</UBadge>
        <p class="fx-type-headline">{{ content.showcase.eyebrow }}</p>
        <h2 id="landing-product-showcase-title">{{ content.showcase.title }}</h2>
        <p>{{ content.showcase.description }}</p>
        <UButton
          :to="content.showcase.action.to"
          size="lg"
          class="landing-product__showcase-action"
          :trailing-icon="content.showcase.action.icon || 'i-lucide-arrow-right'"
        >
          {{ content.showcase.action.label }}
        </UButton>
      </div>

      <div class="landing-product__showcase-links">
        <NuxtLink
          v-for="experience in content.showcase.experiences"
          :key="experience.to"
          :to="experience.to"
        >
          <span><UIcon :name="experience.icon" aria-hidden="true" /></span>
          <div>
            <small>{{ experience.eyebrow }}</small>
            <strong>{{ experience.title }}</strong>
            <p>{{ experience.copy }}</p>
          </div>
          <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
        </NuxtLink>
      </div>
    </section>

    <section
      v-reveal
      class="landing-product__section landing-product__operations"
      aria-labelledby="landing-product-operations-title"
    >
      <div class="landing-product__section-heading landing-product__section-heading--split">
        <div>
          <p class="fx-type-headline">{{ content.operations.eyebrow }}</p>
          <h2 id="landing-product-operations-title">{{ content.operations.title }}</h2>
        </div>
        <div>
          <p>{{ content.operations.description }}</p>
          <UButton
            :to="content.operations.action.to"
            color="neutral"
            variant="soft"
            :trailing-icon="content.operations.action.icon || 'i-lucide-arrow-right'"
          >
            {{ content.operations.action.label }}
          </UButton>
        </div>
      </div>

      <div class="landing-product__operation-grid">
        <NuxtLink
          v-for="operation in content.operations.items"
          :key="operation.id"
          :to="operation.to"
        >
          <span>
            <UIcon :name="operation.icon || 'i-lucide-circle-dot'" aria-hidden="true" />
          </span>
          <div>
            <strong>{{ operation.title }}</strong>
            <small>{{ operation.description }}</small>
          </div>
          <UIcon name="i-lucide-chevron-right" aria-hidden="true" />
        </NuxtLink>
      </div>
    </section>

    <section
      v-if="$slots.apps"
      v-reveal="'left'"
      class="landing-product__section landing-product__apps"
      aria-labelledby="landing-product-apps-title"
    >
      <slot name="apps" />
    </section>

    <section
      v-reveal="'right'"
      class="landing-product__section landing-product__people"
      aria-labelledby="landing-product-audiences-title"
    >
      <div class="landing-product__section-heading">
        <p class="fx-type-headline">{{ content.audiences.eyebrow }}</p>
        <h2 id="landing-product-audiences-title">{{ content.audiences.title }}</h2>
      </div>

      <div class="landing-product__people-grid">
        <article v-for="audience in content.audiences.items" :key="audience.title">
          <span><UIcon :name="audience.icon" aria-hidden="true" /></span>
          <h3>{{ audience.title }}</h3>
          <p>{{ audience.copy }}</p>
          <UButton
            :to="audience.to"
            color="neutral"
            variant="link"
            class="landing-product__card-link"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ audience.action }}
          </UButton>
        </article>
      </div>
    </section>

    <section
      v-reveal="'scale'"
      class="landing-product__final"
      aria-labelledby="landing-product-final-title"
    >
      <div>
        <p class="fx-type-headline">{{ content.finalCta.eyebrow }}</p>
        <h2 id="landing-product-final-title">{{ content.finalCta.title }}</h2>
        <p>{{ content.finalCta.description }}</p>
      </div>
      <div>
        <UButton
          :to="content.finalCta.primaryAction.to"
          size="xl"
          :trailing-icon="content.finalCta.primaryAction.icon || 'i-lucide-arrow-right'"
        >
          {{ content.finalCta.primaryAction.label }}
        </UButton>
        <UButton
          :to="content.finalCta.secondaryAction.to"
          size="xl"
          color="neutral"
          variant="soft"
          :icon="content.finalCta.secondaryAction.icon"
        >
          {{ content.finalCta.secondaryAction.label }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ObjectDirective } from 'vue'
import type { LandingProductIndexContent } from '../../../types/landing-product'

type RevealDirection = 'up' | 'left' | 'right' | 'scale'

withDefaults(defineProps<{
  content: LandingProductIndexContent
  heroLayout?: 'balanced' | 'proof-wide'
  heroMode?: 'full' | 'copy-proof'
}>(), {
  heroLayout: 'balanced',
  heroMode: 'full',
})

const revealObservers = new WeakMap<HTMLElement, IntersectionObserver>()

const vReveal: ObjectDirective<HTMLElement, RevealDirection> = {
  mounted(element, binding) {
    element.dataset.reveal = binding.value || 'up'

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !('IntersectionObserver' in window)
    ) {
      element.classList.add('is-reveal-visible')
      return
    }

    element.classList.add('is-reveal-ready')
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some(entry => entry.isIntersecting)) return
        element.classList.add('is-reveal-visible')
        observer.disconnect()
        revealObservers.delete(element)
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    )

    revealObservers.set(element, observer)
    observer.observe(element)
  },
  unmounted(element) {
    revealObservers.get(element)?.disconnect()
    revealObservers.delete(element)
  },
}
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-product {
  display: grid;
  overflow-x: clip;
  gap: calc(var(--spacing) * 15);
  padding: calc(var(--spacing) * 5) 0 calc(var(--spacing) * 18);
}

.landing-product.landing-product--full-hero {
  box-sizing: border-box;
  width: 100dvw;
  margin-inline: calc(50% - 50dvw);
  padding-inline: clamp(
    calc(var(--spacing) * 4),
    2vw,
    calc(var(--spacing) * 8)
  );
}

.landing-product :where(h1, h2, h3, p) {
  margin: 0;
}

.landing-product [data-reveal].is-reveal-ready {
  opacity: 0;
  filter: blur(5px);
  transform: translate3d(0, 2.75rem, 0) scale(0.992);
  transition:
    opacity 700ms ease,
    filter 900ms ease,
    transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, filter, transform;
}

.landing-product [data-reveal="left"].is-reveal-ready {
  transform: translate3d(-3.5rem, 1.5rem, 0) scale(0.992);
}

.landing-product [data-reveal="right"].is-reveal-ready {
  transform: translate3d(3.5rem, 1.5rem, 0) scale(0.992);
}

.landing-product [data-reveal="scale"].is-reveal-ready {
  transform: translate3d(0, 2rem, 0) scale(0.96);
}

.landing-product [data-reveal].is-reveal-visible {
  opacity: 1;
  filter: none;
  transform: translate3d(0, 0, 0) scale(1);
  will-change: auto;
}

.landing-product__hero {
  position: relative;
  display: grid;
  gap: calc(var(--spacing) * 7);
  align-items: center;
  min-height: auto;
}

.landing-product__hero-glow {
  position: absolute;
  z-index: -1;
  top: -10%;
  right: -15%;
  width: min(52rem, 90vw);
  height: min(52rem, 90vw);
  border-radius: 9999px;
  background:
    radial-gradient(circle at 45% 45%, color-mix(in srgb, var(--ui-primary) 22%, transparent), transparent 62%);
  filter: blur(8px);
  pointer-events: none;
}

.landing-product__hero-copy {
  display: grid;
  justify-items: start;
  gap: calc(var(--spacing) * 4);
}

.landing-product__hero-badge {
  font-size: 0.72rem;
}

.landing-product__hero-heading {
  display: grid;
  gap: 0.3rem;
}

.landing-product__hero-heading > p {
  color: var(--ui-text-muted);
  font-size: 0.95rem;
  font-weight: 750;
  letter-spacing: var(--tracking-tight);
}

.landing-product__hero h1 {
  max-width: none;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-5xl), 14vw, 3.65rem);
  font-weight: 950;
  letter-spacing: -0.07em;
  line-height: 0.88;
  text-wrap: balance;
}

.landing-product__hero h1 span {
  color: var(--ui-primary);
}

.landing-product__hero-description {
  max-width: 43rem;
  color: var(--ui-text-muted);
  font-size: 0.97rem;
  line-height: 1.58;
}

.landing-product__hero-actions,
.landing-product__final > div:last-child {
  display: grid;
  flex-wrap: wrap;
  width: 100%;
  gap: calc(var(--spacing) * 3);
}

.landing-product__hero-actions > * {
  justify-content: center;
  width: 100%;
  min-height: 3.15rem;
}

.landing-product__quiet-link {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  min-height: 2.75rem;
  color: var(--ui-text-muted);
  font-size: 0.9rem;
  font-weight: 650;
  transition: color 160ms ease;
}

.landing-product__quiet-link:hover {
  color: var(--ui-primary);
}

.landing-product__trust-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  gap: 0.55rem 0.8rem;
  padding: 0;
  color: var(--ui-text-muted);
  font-size: 0.69rem;
  font-weight: 650;
  list-style: none;
}

.landing-product__trust-list li {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.landing-product__trust-list svg {
  color: var(--ui-primary);
}

.landing-product__hero-preview {
  min-width: 0;
}

.landing-product__loop {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  gap: calc(var(--spacing) * 3);
  border: 0;
  border-radius: 0;
  background: transparent;
  scroll-padding-inline: 0.1rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.landing-product__loop::-webkit-scrollbar {
  display: none;
}

.landing-product__loop a {
  position: relative;
  display: grid;
  grid-template-columns: auto auto 1fr;
  flex: 0 0 82%;
  gap: 0.8rem;
  align-items: center;
  min-height: 6.25rem;
  padding: 1.15rem;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
  scroll-snap-align: start;
  transition: background 160ms ease;
}

.landing-product__loop a:hover {
  background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
}

.landing-product__loop a > span {
  color: var(--ui-primary);
  font-size: 0.65rem;
  font-weight: 850;
}

.landing-product__loop a > svg {
  color: var(--ui-text-muted);
}

.landing-product__loop strong,
.landing-product__loop small {
  display: block;
}

.landing-product__loop strong {
  color: var(--ui-text-highlighted);
  font-size: 0.83rem;
}

.landing-product__loop small {
  color: var(--ui-text-muted);
  font-size: 0.68rem;
}

.landing-product__loop .landing-product__loop-arrow {
  display: none;
}

.landing-product__section {
  display: grid;
  gap: calc(var(--spacing) * 8);
}

.landing-product__section-heading {
  display: grid;
  max-width: 51rem;
  gap: calc(var(--spacing) * 3);
}

.landing-product__section-heading h2,
.landing-product__showcase h2,
.landing-product__final h2 {
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-4xl), 11vw, 3.15rem);
  font-weight: 920;
  letter-spacing: -0.06em;
  line-height: 0.98;
  text-wrap: balance;
}

.landing-product__section-heading > p:last-child,
.landing-product__section-heading--split > div > p,
.landing-product__showcase-copy > p,
.landing-product__final > div > p:last-child {
  color: var(--ui-text-muted);
  font-size: 0.94rem;
  line-height: 1.62;
}

.landing-product__system-grid,
.landing-product__people-grid {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.landing-product__system-grid > article,
.landing-product__people-grid > article {
  position: relative;
  display: grid;
  align-content: start;
  gap: calc(var(--spacing) * 4);
  min-height: auto;
  padding: 1.35rem;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 6);
  background: var(--ui-bg-elevated);
}

.landing-product__system-grid > article::before {
  position: absolute;
  inset: 0 0 auto;
  height: 0.3rem;
  background: var(--landing-product-area-accent, var(--ui-primary));
  content: '';
}

.landing-product__system-icon,
.landing-product__people-grid > article > span {
  display: grid;
  width: 3.2rem;
  height: 3.2rem;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--landing-product-area-accent, var(--ui-primary)) 14%, transparent);
  color: var(--landing-product-area-accent, var(--ui-primary));
  font-size: 1.35rem;
}

.landing-product__system-grid article > p:first-of-type {
  color: var(--landing-product-area-accent, var(--ui-primary));
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.landing-product__system-grid h3,
.landing-product__people-grid h3 {
  color: var(--ui-text-highlighted);
  font-size: 1.65rem;
  font-weight: 850;
  letter-spacing: -0.035em;
}

.landing-product__system-grid article > p:nth-of-type(2),
.landing-product__people-grid article > p {
  color: var(--ui-text-muted);
  line-height: 1.65;
}

.landing-product__system-grid ul {
  display: grid;
  gap: 0.65rem;
  padding: 0;
  color: var(--ui-text);
  font-size: 0.83rem;
  list-style: none;
}

.landing-product__system-grid li {
  display: flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
}

.landing-product__system-grid li svg {
  color: var(--landing-product-area-accent, var(--ui-primary));
}

.landing-product__card-link {
  justify-self: start;
  align-self: end;
  margin-top: auto;
  padding-inline: 0;
}

.landing-product__showcase {
  position: relative;
  display: grid;
  gap: calc(var(--spacing) * 8);
  overflow: hidden;
  padding: calc(var(--spacing) * 6);
  border-radius: calc(var(--ui-radius) * 6);
  background:
    radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--ui-primary) 18%, transparent), transparent 32%),
    var(--color-neutral-950, #111318);
  color: white;
}

.landing-product__showcase::after {
  position: absolute;
  right: -5rem;
  bottom: -8rem;
  width: 22rem;
  height: 22rem;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 22%, transparent);
  border-radius: 9999px;
  content: '';
}

.landing-product__showcase-copy {
  z-index: 1;
  display: grid;
  justify-items: start;
  align-content: center;
  gap: calc(var(--spacing) * 5);
}

.landing-product__showcase-action {
  justify-content: center;
  width: 100%;
  min-height: 3rem;
}

.landing-product__showcase h2 {
  color: white;
}

.landing-product__showcase-copy > p {
  color: color-mix(in srgb, white 72%, var(--ui-primary));
}

.landing-product__showcase-links {
  z-index: 1;
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.landing-product__showcase-links a {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  padding: 0.9rem;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: calc(var(--ui-radius) * 4);
  background: rgb(255 255 255 / 4.5%);
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.landing-product__showcase-links a:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 50%, transparent);
  background: color-mix(in srgb, var(--ui-primary) 9%, transparent);
  transform: translateX(0.3rem);
}

.landing-product__showcase-links a > span {
  display: grid;
  width: 2.7rem;
  height: 2.7rem;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  color: color-mix(in srgb, var(--ui-primary) 75%, white);
}

.landing-product__showcase-links small,
.landing-product__showcase-links strong,
.landing-product__showcase-links p {
  display: block;
}

.landing-product__showcase-links small {
  color: color-mix(in srgb, white 55%, var(--ui-primary));
  font-size: 0.64rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.landing-product__showcase-links strong {
  margin-top: 0.12rem;
  color: white;
}

.landing-product__showcase-links p {
  margin-top: 0.2rem;
  color: rgb(255 255 255 / 68%);
  font-size: 0.72rem;
}

.landing-product__section-heading--split {
  max-width: none;
}

.landing-product__section-heading--split > div {
  display: grid;
  justify-items: start;
  align-content: start;
  gap: calc(var(--spacing) * 4);
}

.landing-product__operation-grid {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
}

.landing-product__operation-grid a {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.9rem;
  align-items: center;
  min-height: 4.5rem;
  padding: 0.85rem;
  border-bottom: 1px solid var(--ui-border);
  transition: background 160ms ease;
}

.landing-product__operation-grid a:last-child {
  border-bottom: 0;
}

.landing-product__operation-grid a:hover {
  background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
}

.landing-product__operation-grid a > span {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
}

.landing-product__operation-grid strong,
.landing-product__operation-grid small {
  display: block;
}

.landing-product__operation-grid strong {
  color: var(--ui-text-highlighted);
  font-size: 0.88rem;
}

.landing-product__operation-grid small {
  margin-top: 0.12rem;
  color: var(--ui-text-muted);
  font-size: 0.7rem;
}

.landing-product__people-grid > article {
  min-height: auto;
}

.landing-product__final {
  display: grid;
  gap: calc(var(--spacing) * 7);
  align-items: end;
  padding: calc(var(--spacing) * 6);
  border: 1px solid color-mix(in srgb, var(--ui-border) 70%, var(--ui-primary));
  border-radius: calc(var(--ui-radius) * 6);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--ui-primary) 15%, var(--ui-bg-elevated)), var(--ui-bg-elevated));
}

.landing-product__final > div:first-child {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

@media (min-width: 640px) {
  .landing-product {
    gap: clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 36));
    padding: clamp(calc(var(--spacing) * 10), 6vw, calc(var(--spacing) * 22)) 0 calc(var(--spacing) * 24);
  }

  .landing-product__hero {
    gap: clamp(calc(var(--spacing) * 12), 6vw, calc(var(--spacing) * 24));
    min-height: min(52rem, calc(100vh - 7rem));
  }

  .landing-product__hero-copy {
    gap: calc(var(--spacing) * 6);
  }

  .landing-product__hero-badge {
    font-size: inherit;
  }

  .landing-product__hero-heading {
    gap: 0.45rem;
  }

  .landing-product__hero-heading > p {
    font-size: clamp(1.15rem, 2vw, var(--text-2xl));
  }

  .landing-product__hero h1 {
    max-width: 10ch;
    font-size: clamp(3.65rem, 8vw, 7.5rem);
    letter-spacing: -0.075em;
    line-height: 0.86;
  }

  .landing-product__hero-description {
    font-size: clamp(1.05rem, 1.8vw, 1.28rem);
    line-height: 1.75;
  }

  .landing-product__hero-actions,
  .landing-product__final > div:last-child {
    display: flex;
    width: auto;
  }

  .landing-product__hero-actions > * {
    justify-content: normal;
    width: auto;
    min-height: 0;
  }

  .landing-product__quiet-link {
    min-height: 0;
  }

  .landing-product__trust-list {
    display: flex;
    width: auto;
    gap: 0.65rem calc(var(--spacing) * 5);
    padding: calc(var(--spacing) * 2) 0 0;
    font-size: 0.78rem;
  }

  .landing-product__loop {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    overflow-x: hidden;
    gap: 0;
    border: 1px solid var(--ui-border);
    border-radius: calc(var(--ui-radius) * 6);
    background: var(--ui-bg-elevated);
    scroll-snap-type: none;
  }

  .landing-product__loop a {
    flex: none;
    min-height: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    scroll-snap-align: none;
  }

  .landing-product__section {
    gap: clamp(calc(var(--spacing) * 10), 5vw, calc(var(--spacing) * 18));
  }

  .landing-product__section-heading {
    gap: calc(var(--spacing) * 4);
  }

  .landing-product__section-heading h2,
  .landing-product__showcase h2,
  .landing-product__final h2 {
    font-size: clamp(2.5rem, 5.6vw, 5rem);
  }

  .landing-product__section-heading > p:last-child,
  .landing-product__section-heading--split > div > p,
  .landing-product__showcase-copy > p,
  .landing-product__final > div > p:last-child {
    font-size: 1.03rem;
    line-height: 1.75;
  }

  .landing-product__system-grid > article,
  .landing-product__people-grid > article {
    min-height: 27rem;
    padding: clamp(calc(var(--spacing) * 6), 3vw, calc(var(--spacing) * 9));
  }

  .landing-product__showcase {
    gap: clamp(calc(var(--spacing) * 10), 6vw, calc(var(--spacing) * 24));
    padding: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 20));
  }

  .landing-product__showcase-action {
    justify-content: normal;
    width: auto;
    min-height: 0;
  }

  .landing-product__showcase-links a {
    gap: calc(var(--spacing) * 4);
    padding: 1.15rem;
  }

  .landing-product__operation-grid {
    grid-template-columns: repeat(2, 1fr);
    border-radius: calc(var(--ui-radius) * 6);
  }

  .landing-product__operation-grid a {
    min-height: 0;
    padding: calc(var(--spacing) * 4);
  }

  .landing-product__operation-grid a:nth-child(odd) {
    border-right: 1px solid var(--ui-border);
  }

  .landing-product__final {
    gap: calc(var(--spacing) * 10);
    padding: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 16));
  }

}

@media (min-width: 768px) {
  .landing-product__system-grid,
  .landing-product__people-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .landing-product__section-heading--split,
  .landing-product__final {
    grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 0.75fr);
  }
}

@media (min-width: 1024px) {
  .landing-product__hero {
    grid-template-columns: minmax(0, 1.06fr) minmax(26rem, 0.94fr);
  }

  .landing-product__hero--proof-wide {
    grid-template-columns: minmax(0, 1fr);
  }

  .landing-product__loop {
    grid-template-columns: repeat(4, 1fr);
  }

  .landing-product__loop a {
    grid-template-columns: auto auto 1fr auto;
  }

  .landing-product__loop .landing-product__loop-arrow {
    position: absolute;
    right: -0.6rem;
    z-index: 2;
    display: block;
  }

  .landing-product__showcase {
    grid-template-columns: minmax(0, 0.9fr) minmax(25rem, 1.1fr);
  }
}

@media (min-width: 1280px) {
  .landing-product__hero--proof-wide {
    grid-template-columns: minmax(23rem, 0.8fr) minmax(0, 1.2fr);
  }

  .landing-product__hero--proof-wide h1 {
    font-size: clamp(3.65rem, 6.4vw, 7.5rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-product [data-reveal],
  .landing-product [data-reveal].is-reveal-ready,
  .landing-product [data-reveal].is-reveal-visible {
    opacity: 1;
    filter: none;
    transform: none;
    transition: none;
  }

  .landing-product__showcase-links a,
  .landing-product__operation-grid a,
  .landing-product__loop a {
    transition: none;
  }
}
</style>
