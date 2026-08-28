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
      <div v-if="ready" class="template-one-scene-one__identity" data-scene-layer="identity" data-landing-hero-part="heading">
        <h1 :id="titleId" class="sr-only">{{ name }}</h1>
        <img class="template-one-scene-one__wordmark" :src="wordmarkSrc" :alt="name" loading="eager" decoding="async">
      </div>
      <div v-if="ready" class="template-one-scene-one__copy" data-scene-layer="copy" data-landing-hero-part="description">
        <p class="template-one-scene-one__tagline">
          <span v-for="line in tagline" :key="line">{{ line }}</span>
        </p>
        <NuxtLink v-if="showAction" class="template-one-scene-one__menu-link" :to="menuTo">
          <span>BROWSE MENU</span>
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
      <div v-if="ready" class="template-one-scene-one__product" data-scene-layer="product" data-landing-hero-part="preview">
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
      data-landing-hero-part="trust"
      :href="scrollTo"
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
import type { AppPalette, AppTypography, TemplateOneFlagshipDish, TemplateOneSceneOneRequirements } from '../../models/template-one'

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
  scrollTo?: string
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
  scrollTo: '#menu',
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

<style scoped src="../../assets/styles/template-one-scene-one.css"></style>
