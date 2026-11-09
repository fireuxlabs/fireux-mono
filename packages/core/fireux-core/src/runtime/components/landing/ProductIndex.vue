<template>
  <div
    ref="landingRoot"
    class="landing-product"
    :class="{
      'landing-product--full-hero': heroLayout === 'proof-wide',
      'landing-product--hero-onboarding': onboardingPlacement === 'hero',
      'landing-product--immersive': presentation === 'immersive',
      'landing-product--section-dwell': sectionDwell,
    }"
  >
    <section
      class="landing-product__hero"
      :class="{
        'landing-product__hero--proof-wide': heroLayout === 'proof-wide',
        'landing-product__hero--with-onboarding':
          onboardingPlacement === 'hero',
      }"
      aria-labelledby="landing-product-title"
    >
      <div class="landing-product__hero-copy">
        <UBadge
          v-if="content.hero.badge"
          data-landing-hero-part="badge"
          color="primary"
          variant="soft"
          size="lg"
          class="landing-product__hero-badge"
        >
          {{ content.hero.badge }}
        </UBadge>

        <div
          ref="heroHeading"
          class="landing-product__hero-heading"
          data-landing-hero-part="heading"
        >
          <p v-if="content.hero.kicker">{{ content.hero.kicker }}</p>
          <h1 id="landing-product-title">
            {{ content.hero.title }}<br />
            <span>
              <template v-if="Array.isArray(content.hero.accent)">
                <template
                  v-for="(line, index) in content.hero.accent"
                  :key="line"
                >
                  {{ line }}<br v-if="index < content.hero.accent.length - 1" />
                </template>
              </template>
              <template v-else>{{ content.hero.accent }}</template>
            </span>
          </h1>
        </div>

        <p
          class="landing-product__hero-description"
          data-landing-hero-part="description"
        >
          {{ content.hero.description }}
        </p>

        <div
          v-if="heroMode === 'full'"
          class="landing-product__hero-actions"
          data-landing-hero-part="actions"
        >
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
          data-landing-hero-part="quiet-action"
        >
          {{ content.hero.quietAction.label }}
          <UIcon
            :name="content.hero.quietAction.icon || 'i-lucide-arrow-up-right'"
            aria-hidden="true"
          />
        </NuxtLink>

        <ul
          v-if="heroMode === 'full' && content.hero.trustItems.length"
          class="landing-product__trust-list"
          aria-label="Product principles"
          data-landing-hero-part="trust"
        >
          <li v-for="item in content.hero.trustItems" :key="item">
            <UIcon name="i-lucide-check" aria-hidden="true" />
            {{ item }}
          </li>
        </ul>
      </div>

      <div
        ref="heroPreview"
        class="landing-product__hero-preview"
        data-landing-hero-part="preview"
      >
        <slot name="hero-preview" />
      </div>

      <div
        v-if="onboardingPlacement === 'hero' && $slots.onboarding"
        class="landing-product__hero-onboarding"
      >
        <slot name="onboarding" />
      </div>
    </section>

    <slot v-if="onboardingPlacement === 'section'" name="onboarding" />

    <template v-for="region in regionOrder" :key="region">
      <div
        v-if="$slots[region]"
        class="landing-product__region"
        :class="`landing-product__${region}`"
        :data-landing-motion-stage="region"
      >
        <div class="landing-product__region-dwell">
          <slot :name="region" />
        </div>
        <div class="landing-product__region-dwell-spacer" aria-hidden="true" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import type { LandingProductIndexContent } from '../../models/landing/product'
import { useLandingMotion } from '../../composables/fireux/motion/useLandingMotion'

type LandingProductRegion =
  | 'surfaces'
  | 'workspace'
  | 'specifics'
  | 'ecosystems'
  | 'apps'
  | 'tools'
  | 'solutions'
  | 'operations'

withDefaults(
  defineProps<{
    content: LandingProductIndexContent
    heroLayout?: 'balanced' | 'proof-wide'
    heroMode?: 'full' | 'copy-proof'
    onboardingPlacement?: 'section' | 'hero'
    presentation?: 'standard' | 'immersive'
    regionOrder?: readonly LandingProductRegion[]
    sectionDwell?: boolean
  }>(),
  {
    heroLayout: 'balanced',
    heroMode: 'full',
    onboardingPlacement: 'section',
    presentation: 'standard',
    regionOrder: () => [
      'surfaces',
      'workspace',
      'specifics',
      'ecosystems',
      'apps',
      'tools',
      'solutions',
      'operations',
    ],
    sectionDwell: true,
  }
)

const landingRoot = useTemplateRef<HTMLElement>('landingRoot')
const heroHeading = useTemplateRef<HTMLElement>('heroHeading')
const heroPreview = useTemplateRef<HTMLElement>('heroPreview')

let heroOverlapObserver: ResizeObserver | undefined

function syncHeroOverlap() {
  const heading = heroHeading.value
  const preview = heroPreview.value
  if (!heading || !preview) return

  const headingRect = heading.getBoundingClientRect()
  const previewRect = preview.getBoundingClientRect()
  const overlapWidth = Math.max(
    0,
    Math.min(headingRect.right, previewRect.right) -
      Math.max(headingRect.left, previewRect.left)
  )
  const overlapHeight = Math.max(
    0,
    Math.min(headingRect.bottom, previewRect.bottom) -
      Math.max(headingRect.top, previewRect.top)
  )
  const hasOverlap = overlapWidth > 0 && overlapHeight > 0
  const fallback = Math.min(128, Math.max(80, window.innerWidth * 0.07))
  const feather = Math.min(192, Math.max(112, window.innerWidth * 0.1))
  const blurWidth = hasOverlap ? overlapWidth + feather : fallback

  preview.style.setProperty(
    '--landing-hero-overlap-width',
    `${Math.ceil(blurWidth)}px`
  )
}

onMounted(async () => {
  await nextTick()
  syncHeroOverlap()
  heroOverlapObserver = new ResizeObserver(syncHeroOverlap)
  if (heroHeading.value) heroOverlapObserver.observe(heroHeading.value)
  if (heroPreview.value) heroOverlapObserver.observe(heroPreview.value)
  window.addEventListener('resize', syncHeroOverlap, { passive: true })
  void document.fonts?.ready.then(syncHeroOverlap)
})

onBeforeUnmount(() => {
  heroOverlapObserver?.disconnect()
  window.removeEventListener('resize', syncHeroOverlap)
})

useLandingMotion(landingRoot)
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-product.landing-product--immersive {
  padding-top: 0;
}

.landing-product--immersive .landing-product__hero {
  position: relative;
  min-height: calc(100svh - var(--ui-header-height, 4rem));
  overflow: visible;
  isolation: isolate;
  align-items: start;
  padding-block: calc(var(--spacing) * 6)
    clamp(calc(var(--spacing) * 10), 8vh, calc(var(--spacing) * 24));
}

.landing-product--immersive .landing-product__hero-copy {
  position: relative;
  z-index: 2;
  max-width: 52rem;
}

.landing-product--immersive .landing-product__hero-badge {
  border-color: color-mix(in srgb, var(--ui-primary) 32%, var(--ui-border));
  box-shadow: 0 0 2.5rem color-mix(in srgb, var(--ui-primary) 12%, transparent);
  font-kerning: normal;
  letter-spacing: var(--tracking-widest);
}

.landing-product--immersive .landing-product__hero h1 {
  max-width: 8ch;
  font-size: clamp(4.25rem, 10.5vw, 10.75rem);
  font-kerning: normal;
  letter-spacing: -0.07em;
  line-height: 0.78;
}

.landing-product--immersive .landing-product__hero h1 span {
  white-space: nowrap;
}

.landing-product--immersive .landing-product__hero-description {
  max-width: 36rem;
  font-size: clamp(var(--text-lg), 1.5vw, var(--text-2xl));
}

.landing-product--immersive .landing-product__hero-preview {
  position: relative;
  z-index: 1;
  min-height: 31rem;
}

.landing-product--immersive .landing-product__region {
  position: relative;
  padding-block: clamp(
    calc(var(--spacing) * 14),
    10vw,
    calc(var(--spacing) * 36)
  );
  border-top: 1px solid
    color-mix(in srgb, var(--ui-primary) 16%, var(--ui-border));
}

.landing-product--immersive .landing-product__region:nth-child(even)::before {
  position: absolute;
  z-index: -1;
  inset: 0 calc(var(--landing-product-gutter) * -1);
  background: color-mix(in srgb, var(--ui-bg-elevated) 34%, transparent);
  content: '';
}

.landing-product--immersive .landing-product__region :deep(h2) {
  font-size: clamp(3.25rem, 7vw, 7.5rem);
  letter-spacing: -0.075em;
  line-height: 0.88;
}

@media (min-width: 48rem) and (prefers-reduced-motion: no-preference) {
  .landing-product--immersive.landing-product--section-dwell
    .landing-product__region-dwell {
    position: sticky;
    top: clamp(1rem, 8vh, 4rem);
  }

  .landing-product--immersive.landing-product--section-dwell
    .landing-product__region-dwell-spacer {
    display: block;
    height: clamp(10rem, 12vh, 12rem);
  }
}

@media (min-width: 64rem) {
  .landing-product--immersive .landing-product__hero,
  .landing-product--immersive .landing-product__hero--proof-wide {
    grid-template-columns: minmax(32rem, 1.05fr) minmax(34rem, 0.95fr);
    gap: 0;
  }

  .landing-product--immersive .landing-product__hero-preview {
    width: min(66vw, 70rem);
    margin-left: clamp(
      calc(var(--spacing) * -40),
      -8vw,
      calc(var(--spacing) * -16)
    );
  }
}

.landing-product {
  display: grid;
  min-width: 0;
  overflow-x: clip;
  padding: calc(var(--spacing) * 5) 0 calc(var(--spacing) * 18);
}

.landing-product.landing-product--full-hero {
  --landing-product-gutter: clamp(
    calc(var(--spacing) * 4),
    2vw,
    calc(var(--spacing) * 8)
  );

  box-sizing: border-box;
  width: 100dvw;
  margin-inline: calc(50% - 50dvw);
  padding-inline: var(--landing-product-gutter);
}

.landing-product :where(h1, p) {
  margin: 0;
}

.landing-product__region,
.landing-product__region-dwell {
  min-width: 0;
}

.landing-product__region-dwell-spacer {
  display: none;
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

.landing-product.is-gsap-motion
  :deep([data-reveal].is-reveal-ready.is-reveal-armed) {
  transition: none;
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
  .landing-product:not(.is-motion-pending, .is-gsap-motion)
    .landing-product__hero-copy {
    animation: landing-product-hero-enter 500ms 60ms both
      cubic-bezier(0.16, 1, 0.3, 1);
  }

  .landing-product:not(.is-motion-pending, .is-gsap-motion)
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
  font-family: var(--font-fireux-hero);
  font-size: clamp(var(--text-5xl), 14vw, 3.65rem);
  font-weight: var(--font-weight-fireux-hero);
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

.landing-product__hero-onboarding {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 2);
}

.landing-product__hero--with-onboarding {
  padding-bottom: calc(var(--spacing) * 2);
}

.landing-product--hero-onboarding
  .landing-product__workspace
  :deep(.landing-product-proof) {
  padding-top: calc(var(--spacing) * 6);
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

  .landing-product__hero--with-onboarding {
    row-gap: calc(var(--spacing) * 6);
  }

  .landing-product--hero-onboarding
    .landing-product__workspace
    :deep(.landing-product-proof) {
    padding-top: calc(var(--spacing) * 8);
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

  .landing-product__hero-onboarding {
    grid-column: 1 / -1;
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
