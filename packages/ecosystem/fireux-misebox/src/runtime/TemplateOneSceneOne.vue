<template>
  <section
    class="template-one-scene-one"
    :style="themeStyle"
    :aria-labelledby="titleId"
    :data-presentation="present"
    :data-mobile-composition="mobileComposition"
    data-landing-scene="hero"
  >
    <div
      class="template-one-scene-one__texture template-one-scene-one__texture--shadow"
      data-scene-layer="texture-shadow"
    />
    <div
      class="template-one-scene-one__texture template-one-scene-one__texture--highlight"
      data-scene-layer="texture-highlight"
    />
    <div class="template-one-scene-one__content" data-scene-layer="content">
      <div v-if="ready" class="template-one-scene-one__identity" data-scene-layer="identity">
        <h1 :id="titleId" class="sr-only">{{ name }}</h1>
        <img class="template-one-scene-one__wordmark" :src="wordmarkSrc" :alt="name" loading="eager" decoding="async">
      </div>
      <div v-if="ready" class="template-one-scene-one__copy" data-scene-layer="copy">
        <p class="template-one-scene-one__tagline">
          <span v-for="line in tagline" :key="line">{{ line }}</span>
        </p>
        <NuxtLink v-if="showAction" class="template-one-scene-one__menu-link" :to="menuTo">
          <span>ORDER NOW</span>
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
      <div v-if="ready" class="template-one-scene-one__product" data-scene-layer="product">
        <img
          :src="flagshipDish?.image"
          :alt="flagshipDish?.name || ''"
          loading="eager"
          decoding="async"
        >
      </div>
      <div v-else class="template-one-scene-one__not-ready">
        <h1 :id="titleId">{{ name }}</h1>
        <p>Template One is not ready.</p>
        <ul>
          <li v-if="!requirements.wordmark">Canonical wordmark missing</li>
          <li v-if="!requirements.palette">Effective palette missing</li>
          <li v-if="!requirements.typography">Typography families missing</li>
          <li v-if="!requirements.flagshipDish">Unique flagship Dish missing</li>
        </ul>
      </div>
    </div>
    <a
      v-if="showScrollCue"
      class="template-one-scene-one__scroll-cue"
      href="#method"
      aria-label="Scroll to explore"
    >
      <span class="template-one-scene-one__scroll-mark" aria-hidden="true">
        <span />
      </span>
      <span>Scroll to explore</span>
    </a>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppPalette, AppTypography, TemplateOneFlagshipDish, TemplateOneSceneOneRequirements } from './template-one'

const props = withDefaults(defineProps<{
  name: string
  wordmarkSrc?: string
  placePrimaryColor: string
  present?: 'wordmark'
  identityAlignment?: 'left' | 'center'
  palette: AppPalette
  typography: AppTypography
  flagshipDish?: TemplateOneFlagshipDish | null
  tagline?: readonly string[]
  requirements: TemplateOneSceneOneRequirements
  menuTo?: string
  showAction?: boolean
  showScrollCue?: boolean
  mobileComposition?: 'default' | '1' | '2' | '3' | '4' | '5'
  productCrop?: {
    visibleAspect: number
    scale: number
    offsetX: number
    offsetY: number
  }
}>(), {
  wordmarkSrc: '',
  menuTo: '/menus',
  identityAlignment: 'left',
  present: 'wordmark',
  tagline: () => [],
  showAction: true,
  showScrollCue: true,
  mobileComposition: 'default',
  productCrop: () => ({ visibleAspect: 1, scale: 1, offsetX: 0, offsetY: 0 }),
})

const titleId = computed(() =>
  `template-one-${props.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
)
const ready = computed(() =>
  props.requirements.wordmark &&
  props.requirements.palette &&
  props.requirements.typography &&
  props.requirements.flagshipDish &&
  Boolean(props.flagshipDish?.image)
)
const themeStyle = computed(() => ({
  '--template-one-primary': props.placePrimaryColor,
  '--template-one-text': props.palette.text,
  '--template-one-muted': props.palette.text_muted,
  '--template-one-surface': props.palette.surface,
  '--template-one-accent': props.palette.accent,
  '--template-one-display-family': props.typography.display_family,
  '--template-one-body-family': props.typography.body_family,
  '--template-one-product-aspect': String(props.productCrop.visibleAspect),
  '--template-one-product-scale': String(props.productCrop.scale),
  '--template-one-product-x': `${props.productCrop.offsetX}%`,
  '--template-one-product-y': `${props.productCrop.offsetY}%`,
}))
</script>

<style scoped>
.template-one-scene-one {
  position: relative;
  color: var(--template-one-text);
  background: var(--template-one-primary);
  isolation: isolate;
  overflow: clip;
}

.template-one-scene-one__texture {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: url('/img/template-one/charcoal-texture.webp') center / cover;
  filter: grayscale(1);
  pointer-events: none;
}

.template-one-scene-one__texture--shadow {
  mix-blend-mode: multiply;
  opacity: .54;
}

.template-one-scene-one__texture--highlight {
  mix-blend-mode: screen;
  opacity: .28;
}

.template-one-scene-one__content {
  position: relative;
  z-index: 1;
  display: grid;
  gap: calc(var(--spacing) * 6);
  padding: calc(var(--spacing) * 7) calc(var(--spacing) * 4) calc(var(--spacing) * 8);
}

.template-one-scene-one__wordmark {
  display: block;
  width: 100%;
  height: auto;
}

.template-one-scene-one__copy {
  display: grid;
  gap: calc(var(--spacing) * 4);
  width: min(76%, 18rem);
}

.template-one-scene-one__tagline {
  display: grid;
  margin: 0;
  font-family: var(--template-one-display-family);
  font-size: clamp(var(--text-2xl), 7vw, var(--text-4xl));
  font-weight: var(--font-weight-bold);
  line-height: .95;
  letter-spacing: var(--tracking-tight);
  text-transform: uppercase;
}

.template-one-scene-one__tagline span:last-child {
  color: var(--template-one-accent);
}

.template-one-scene-one__tagline::after {
  width: calc(var(--spacing) * 20);
  height: 1px;
  margin-top: calc(var(--spacing) * 3);
  background: var(--template-one-accent);
  content: '';
}

.template-one-scene-one__product {
  position: relative;
  justify-self: end;
  width: min(92%, 30rem);
  aspect-ratio: var(--template-one-product-aspect);
  overflow: hidden;
}

.template-one-scene-one__product img {
  position: absolute;
  top: var(--template-one-product-y);
  left: var(--template-one-product-x);
  display: block;
  width: calc(100% * var(--template-one-product-scale));
  max-width: none;
  height: auto;
  filter: drop-shadow(0 calc(var(--spacing) * 8) calc(var(--spacing) * 8) rgb(0 0 0 / 45%));
}

.template-one-scene-one__menu-link {
  display: inline-flex;
  gap: calc(var(--spacing) * 8);
  align-items: center;
  justify-content: space-between;
  width: fit-content;
  min-height: calc(var(--spacing) * 11);
  padding-inline: calc(var(--spacing) * 4);
  color: var(--template-one-primary);
  background: var(--template-one-accent);
  font-family: var(--template-one-body-family);
  font-weight: var(--font-weight-bold);
}

.template-one-scene-one__not-ready {
  display: grid;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 5);
  background: var(--template-one-surface);
}

.template-one-scene-one__not-ready h1,
.template-one-scene-one__not-ready p,
.template-one-scene-one__not-ready ul {
  margin: 0;
}

.template-one-scene-one__scroll-cue {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  margin: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 6);
  color: var(--template-one-muted);
  font-family: var(--template-one-body-family);
  font-size: var(--text-xs);
  text-transform: uppercase;
}

.template-one-scene-one__scroll-mark {
  width: calc(var(--spacing) * 8);
  height: 1px;
  background: var(--template-one-accent);
}

@media (max-width: 63.999rem) {
  .template-one-scene-one__content {
    grid-template: auto minmax(20rem, 1fr) / minmax(0, 1fr);
    gap: calc(var(--spacing) * 3);
    min-height: calc(100svh - 8.3125rem);
  }

  .template-one-scene-one__copy {
    z-index: 3;
    grid-row: 2;
    grid-column: 1;
    align-self: start;
    width: min(48%, 12rem);
    padding-top: calc(var(--spacing) * 5);
  }

  .template-one-scene-one__product {
    z-index: 2;
    grid-row: 2;
    grid-column: 1;
    align-self: start;
    justify-self: start;
    width: min(160%, 44rem);
    margin-top: calc(var(--spacing) * 5);
    transform: translate(-47%, 0);
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__content {
    grid-template: auto auto auto / minmax(0, 1fr);
    gap: 0;
    min-height: auto;
    padding: calc(var(--spacing) * 12) calc(var(--spacing) * 6) calc(var(--spacing) * 16);
  }

  .template-one-scene-one[data-mobile-composition='default']::before,
  .template-one-scene-one[data-mobile-composition='default']::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
  }

  .template-one-scene-one[data-mobile-composition='default']::before {
    background:
      radial-gradient(circle at 55% 31%, rgb(217 154 34 / 28%) 0, rgb(217 154 34 / 10%) 19%, transparent 43%),
      radial-gradient(ellipse at 50% 37%, rgb(243 233 210 / 12%) 0, transparent 47%);
    mix-blend-mode: screen;
  }

  .template-one-scene-one[data-mobile-composition='default']::after {
    background:
      linear-gradient(to bottom, transparent 42%, rgb(0 0 0 / 20%) 70%, rgb(0 0 0 / 48%) 100%),
      radial-gradient(ellipse at center, transparent 30%, rgb(0 0 0 / 44%) 100%);
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__identity {
    z-index: 1;
    grid-row: 1;
    opacity: .9;
    filter: drop-shadow(0 1px 0 rgb(255 255 255 / 10%));
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__product {
    z-index: 2;
    grid-row: 2;
    justify-self: center;
    width: min(100%, 32rem);
    margin-top: calc(var(--spacing) * -5);
    transform: none;
    overflow: visible;
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__product::before {
    position: absolute;
    right: 4%;
    bottom: -6%;
    left: 4%;
    height: 24%;
    background: rgb(0 0 0 / 72%);
    border-radius: 50%;
    filter: blur(calc(var(--spacing) * 6));
    transform: perspective(20rem) rotateX(68deg);
    content: '';
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__product img {
    z-index: 1;
    filter:
      drop-shadow(0 calc(var(--spacing) * 4) calc(var(--spacing) * 3) rgb(0 0 0 / 38%))
      drop-shadow(0 calc(var(--spacing) * 10) calc(var(--spacing) * 9) rgb(0 0 0 / 58%));
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__copy {
    grid-row: 3;
    align-self: auto;
    width: 100%;
    gap: calc(var(--spacing) * 8);
    padding-top: calc(var(--spacing) * 10);
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__tagline {
    font-size: clamp(var(--text-xl), 7.2vw, var(--text-3xl));
    font-weight: var(--font-weight-medium);
    line-height: 1.42;
    letter-spacing: var(--tracking-wide);
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__menu-link {
    justify-self: center;
    justify-content: center;
    width: min(76%, 22rem);
    min-height: calc(var(--spacing) * 18);
    margin-top: calc(var(--spacing) * 8);
    box-shadow:
      0 calc(var(--spacing) * 3) calc(var(--spacing) * 8) rgb(0 0 0 / 42%),
      inset 0 1px 0 rgb(255 255 255 / 18%);
    font-family: var(--template-one-display-family);
    font-size: var(--text-2xl);
    text-transform: uppercase;
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__menu-link span:last-child {
    display: none;
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__scroll-cue {
    z-index: 2;
    justify-content: center;
    width: 100%;
    margin: 0 0 calc(var(--spacing) * 12);
  }

  .template-one-scene-one[data-mobile-composition='2'] .template-one-scene-one__product {
    justify-self: end;
    transform: translate(47%, 0);
  }

  .template-one-scene-one[data-mobile-composition='3'] .template-one-scene-one__product {
    align-self: end;
    justify-self: center;
    width: min(132%, 38rem);
    transform: translateY(32%);
  }

  .template-one-scene-one[data-mobile-composition='4'] .template-one-scene-one__identity {
    z-index: 3;
  }

  .template-one-scene-one[data-mobile-composition='4'] .template-one-scene-one__product {
    align-self: start;
    justify-self: center;
    width: min(138%, 40rem);
    margin-top: calc(var(--spacing) * -8);
    transform: none;
  }

  .template-one-scene-one[data-mobile-composition='5'] .template-one-scene-one__product {
    align-self: stretch;
    justify-self: end;
    width: 68%;
    height: 100%;
    margin-top: 0;
    transform: translateX(18%);
  }

  .template-one-scene-one[data-mobile-composition='5'] .template-one-scene-one__product img {
    top: 0;
    left: 50%;
    width: auto;
    height: 100%;
    transform: translateX(-50%);
  }
}

@media (max-width: 22.5rem) {
  .template-one-scene-one__content {
    grid-template-rows: auto minmax(18rem, 1fr);
  }

  .template-one-scene-one__product {
    width: min(155%, 38rem);
    transform: translate(-46%, 0);
  }

  .template-one-scene-one[data-mobile-composition='default'] .template-one-scene-one__product {
    width: min(100%, 28rem);
    transform: none;
  }
}

@media (min-width: 64rem) {
  .template-one-scene-one {
    min-height: min(64rem, calc(100svh - 9rem));
  }

  .template-one-scene-one__content {
    grid-template: auto 1fr / minmax(15rem, 28%) minmax(0, 1fr);
    gap: 0 3vw;
    min-height: inherit;
    padding: clamp(calc(var(--spacing) * 10), 5vw, calc(var(--spacing) * 20));
  }

  .template-one-scene-one__identity {
    grid-column: 1 / -1;
    z-index: 1;
  }

  .template-one-scene-one__wordmark {
    width: min(88vw, 84rem);
  }

  .template-one-scene-one__copy {
    z-index: 3;
    grid-row: 2;
    grid-column: 1;
    align-self: end;
    width: 100%;
    padding-bottom: clamp(calc(var(--spacing) * 8), 8svh, calc(var(--spacing) * 20));
  }

  .template-one-scene-one__tagline {
    font-size: clamp(var(--text-3xl), 3vw, var(--text-5xl));
  }

  .template-one-scene-one__product {
    z-index: 2;
    align-self: end;
    justify-self: end;
    width: min(72vw, 70rem);
    margin-top: -18svh;
    transform: translateY(calc(var(--spacing) * 3));
  }
}
</style>
