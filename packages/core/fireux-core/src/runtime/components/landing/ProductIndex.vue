<template>
  <div
    ref="landingRoot"
    class="landing-product"
    :class="{ 'landing-product--full-hero': heroLayout === 'proof-wide' }"
  >
    <section
      class="landing-product__hero"
      :class="{
        'landing-product__hero--proof-wide': heroLayout === 'proof-wide',
      }"
      aria-labelledby="landing-product-title"
    >
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
            {{ content.hero.title }}<br />
            <span>{{ content.hero.accent }}</span>
          </h1>
        </div>

        <p class="landing-product__hero-description">
          {{ content.hero.description }}
        </p>

        <div v-if="heroMode === 'full'" class="landing-product__hero-actions">
          <UButton
            :to="content.hero.primaryAction.to"
            size="xl"
            :trailing-icon="
              content.hero.primaryAction.icon || 'i-lucide-arrow-right'
            "
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

    <slot name="onboarding" />

    <div
      v-if="$slots.console"
      class="landing-product__region landing-product__console"
    >
      <slot name="console" />
    </div>

    <div
      v-if="$slots.specifics"
      class="landing-product__region landing-product__specifics"
    >
      <slot name="specifics" />
    </div>

    <div
      v-if="$slots.ecosystems"
      class="landing-product__region landing-product__ecosystems"
    >
      <slot name="ecosystems" />
    </div>

    <div
      v-if="$slots.apps"
      class="landing-product__region landing-product__apps"
    >
      <slot name="apps" />
    </div>

    <div
      v-if="$slots.tools"
      class="landing-product__region landing-product__tools"
    >
      <slot name="tools" />
    </div>

    <div
      v-if="$slots.solutions"
      class="landing-product__region landing-product__solutions"
    >
      <slot name="solutions" />
    </div>

    <div
      v-if="$slots.operations"
      class="landing-product__region landing-product__operations"
    >
      <slot name="operations" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  useTemplateRef,
} from 'vue'
import type { LandingProductIndexContent } from '../../../types/landing-product'

type RevealDirection = 'up' | 'left' | 'right' | 'scale'

withDefaults(
  defineProps<{
    content: LandingProductIndexContent
    heroLayout?: 'balanced' | 'proof-wide'
    heroMode?: 'full' | 'copy-proof'
  }>(),
  {
    heroLayout: 'balanced',
    heroMode: 'full',
  }
)

const activeRevealObservers = new Set<IntersectionObserver>()
const landingRoot = useTemplateRef<HTMLElement>('landingRoot')

function observeReveal(
  element: HTMLElement,
  direction: RevealDirection = 'up'
) {
  element.dataset.reveal = direction

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    element.classList.add('is-reveal-visible')
    return
  }

  element.classList.add('is-reveal-ready')
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      element.classList.add('is-reveal-visible')
      observer.disconnect()
      activeRevealObservers.delete(observer)
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
  )

  activeRevealObservers.add(observer)
  requestAnimationFrame(() => {
    if (!element.isConnected) return
    element.classList.add('is-reveal-armed')
    observer.observe(element)
  })
}

onMounted(async () => {
  await nextTick()

  landingRoot.value
    ?.querySelectorAll<HTMLElement>('[data-landing-reveal]')
    .forEach((element) => {
      const direction = element.dataset.landingReveal as RevealDirection
      observeReveal(element, direction || 'up')
    })
})

onBeforeUnmount(() => {
  activeRevealObservers.forEach((observer) => observer.disconnect())
  activeRevealObservers.clear()
})
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-product {
  display: grid;
  min-width: 0;
  overflow-x: clip;
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

.landing-product :where(h1, p) {
  margin: 0;
}

.landing-product__region {
  min-width: 0;
}

.landing-product :deep([data-reveal].is-reveal-ready:not(.is-reveal-visible)) {
  opacity: 0;
  transform: translate3d(0, calc(var(--spacing) * 3), 0);
  will-change: opacity, transform;
}

.landing-product :deep([data-reveal].is-reveal-ready.is-reveal-armed) {
  transition:
    opacity 420ms ease,
    transform 480ms cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--landing-reveal-delay, 0ms);
}

.landing-product
  :deep([data-reveal='left'].is-reveal-ready:not(.is-reveal-visible)),
.landing-product
  :deep([data-reveal='right'].is-reveal-ready:not(.is-reveal-visible)),
.landing-product
  :deep([data-reveal='scale'].is-reveal-ready:not(.is-reveal-visible)) {
  transform: translate3d(0, calc(var(--spacing) * 3), 0);
}

.landing-product :deep([data-reveal].is-reveal-visible) {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  will-change: auto;
}

@media (prefers-reduced-motion: no-preference) {
  .landing-product__hero-copy {
    animation: landing-product-hero-enter 500ms 60ms both
      cubic-bezier(0.16, 1, 0.3, 1);
  }

  .landing-product__hero-preview {
    animation: landing-product-hero-enter 580ms 120ms both
      cubic-bezier(0.16, 1, 0.3, 1);
  }
}

@keyframes landing-product-hero-enter {
  from {
    opacity: 0;
    transform: translate3d(0, calc(var(--spacing) * 3), 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.landing-product__hero {
  position: relative;
  display: grid;
  min-width: 0;
  min-height: auto;
  gap: calc(var(--spacing) * 7);
  align-items: center;
  padding-block: calc(var(--spacing) * 4) calc(var(--spacing) * 10);
}

.landing-product__hero-copy {
  display: grid;
  justify-items: start;
  gap: calc(var(--spacing) * 4);
}

.landing-product__hero-badge {
  font-size: var(--text-xs);
}

.landing-product__hero-heading {
  display: grid;
  gap: calc(var(--spacing) * 1);
}

.landing-product__hero-heading > p {
  color: var(--ui-text-muted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
}

.landing-product__hero h1 {
  max-width: none;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-5xl), 14vw, 3.65rem);
  font-weight: var(--font-weight-black);
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
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.landing-product__hero-actions {
  display: grid;
  width: 100%;
  gap: calc(var(--spacing) * 3);
}

.landing-product__hero-actions > * {
  justify-content: center;
  width: 100%;
  min-height: calc(var(--spacing) * 13);
}

.landing-product__quiet-link {
  display: inline-flex;
  min-height: calc(var(--spacing) * 11);
  gap: calc(var(--spacing) * 2);
  align-items: center;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  transition: color 160ms ease;
}

.landing-product__quiet-link:hover {
  color: var(--ui-primary);
}

.landing-product__trust-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  gap: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  padding: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  list-style: none;
}

.landing-product__trust-list li {
  display: flex;
  gap: var(--spacing);
  align-items: center;
}

.landing-product__trust-list svg {
  flex: 0 0 auto;
  color: var(--ui-primary);
}

.landing-product__hero-preview {
  min-width: 0;
}

.landing-product__apps {
  padding-block: calc(var(--spacing) * 10);
}

@media (min-width: 640px) {
  .landing-product {
    padding: clamp(calc(var(--spacing) * 10), 6vw, calc(var(--spacing) * 22)) 0
      calc(var(--spacing) * 24);
  }

  .landing-product__hero {
    min-height: min(52rem, calc(100vh - 7rem));
    gap: clamp(calc(var(--spacing) * 12), 6vw, calc(var(--spacing) * 24));
  }

  .landing-product__hero-copy {
    gap: calc(var(--spacing) * 6);
  }

  .landing-product__hero-badge {
    font-size: inherit;
  }

  .landing-product__hero-heading > p {
    font-size: clamp(var(--text-lg), 2vw, var(--text-2xl));
  }

  .landing-product__hero h1 {
    max-width: 10ch;
    font-size: clamp(3.65rem, 8vw, 7.5rem);
    letter-spacing: -0.075em;
    line-height: 0.86;
  }

  .landing-product__hero-description {
    font-size: clamp(var(--text-lg), 1.8vw, var(--text-xl));
  }

  .landing-product__hero-actions {
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
    gap: calc(var(--spacing) * 5);
    padding-top: calc(var(--spacing) * 2);
    font-size: var(--text-sm);
  }

  .landing-product__apps {
    padding-block: calc(var(--spacing) * 14);
  }
}

@media (min-width: 768px) {
  .landing-product
    :deep([data-reveal='left'].is-reveal-ready:not(.is-reveal-visible)) {
    transform: translate3d(calc(var(--spacing) * -4), 0, 0);
  }

  .landing-product
    :deep([data-reveal='right'].is-reveal-ready:not(.is-reveal-visible)) {
    transform: translate3d(calc(var(--spacing) * 4), 0, 0);
  }
}

@media (min-width: 1024px) {
  .landing-product__hero,
  .landing-product__hero--proof-wide {
    grid-template-columns: minmax(23rem, 0.85fr) minmax(0, 1.15fr);
  }
}

@media (min-width: 1280px) {
  .landing-product__hero--proof-wide {
    grid-template-columns: minmax(23rem, 0.78fr) minmax(0, 1.22fr);
  }

  .landing-product__hero--proof-wide h1 {
    font-size: clamp(3.65rem, 6.4vw, 7.5rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-product :deep([data-reveal]),
  .landing-product :deep([data-reveal].is-reveal-ready),
  .landing-product :deep([data-reveal].is-reveal-visible) {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .landing-product__quiet-link {
    transition: none;
  }
}
</style>
