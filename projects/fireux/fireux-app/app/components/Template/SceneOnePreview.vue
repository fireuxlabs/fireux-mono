<template>
  <article
    class="scene-one"
    :style="brandStyle"
    :data-template-brand="brand.id"
    data-template-anatomy="scene-one"
  >
    <header class="scene-one__header">
      <a href="#top" :aria-label="`${brand.name} home`">
        <img
          v-if="brand.wordmark"
          class="scene-one__wordmark"
          :src="brand.wordmark.src"
          :alt="brand.wordmark.alt"
          :width="brand.wordmark.width"
          :height="brand.wordmark.height"
        />
        <span v-else class="scene-one__wordmark-fallback">{{
          brand.name
        }}</span>
      </a>
      <nav aria-label="Preview navigation">
        <a href="#story">Story</a>
        <a href="#proof">Menu</a>
      </nav>
    </header>

    <main>
      <section
        class="scene-one__scene scene-one__hero"
        data-landing-scene="hero"
      >
        <div aria-hidden="true" data-scene-layer="background" />
        <div class="scene-one__content" data-scene-layer="content">
          <p class="scene-one__eyebrow">{{ brand.eyebrow }}</p>
          <h1>{{ brand.headline }}</h1>
          <p class="scene-one__description">{{ brand.description }}</p>
          <div class="scene-one__actions">
            <a class="scene-one__primary" :href="brand.primaryAction.to">
              {{ brand.primaryAction.label }}
            </a>
            <a :href="brand.secondaryAction.to">{{
              brand.secondaryAction.label
            }}</a>
          </div>
        </div>
        <div class="scene-one__media" data-scene-layer="foreground">
          <img
            v-if="brand.heroMedia"
            :src="brand.heroMedia.src"
            :alt="brand.heroMedia.alt"
            :width="brand.heroMedia.width"
            :height="brand.heroMedia.height"
          />
          <div v-else class="scene-one__media-fallback">
            <span aria-hidden="true">III</span>
            <p>Product image intentionally unassigned</p>
          </div>
        </div>
      </section>

      <section
        id="proof"
        class="scene-one__scene scene-one__proof"
        data-landing-scene="proof"
      >
        <div aria-hidden="true" data-scene-layer="background" />
        <div class="scene-one__content" data-scene-layer="content">
          <p class="scene-one__eyebrow">The product</p>
          <ol>
            <li v-for="(proof, index) in brand.proof" :key="proof">
              <span>0{{ index + 1 }}</span>
              {{ proof }}
            </li>
          </ol>
        </div>
        <div aria-hidden="true" data-scene-layer="foreground" />
      </section>

      <section
        id="story"
        class="scene-one__scene scene-one__story"
        data-landing-scene="story"
      >
        <div aria-hidden="true" data-scene-layer="background" />
        <div class="scene-one__content" data-scene-layer="content">
          <p class="scene-one__eyebrow">One clear story</p>
          <h2>{{ brand.headline }}</h2>
          <a class="scene-one__primary" :href="brand.primaryAction.to">
            {{ brand.primaryAction.label }}
          </a>
        </div>
        <div aria-hidden="true" data-scene-layer="foreground" />
      </section>
    </main>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LandingTemplateBrand } from '../../types/landing-template'

const props = defineProps<{ brand: LandingTemplateBrand }>()

const brandStyle = computed(() => ({
  '--template-canvas': props.brand.palette.canvas,
  '--template-surface': props.brand.palette.surface,
  '--template-ink': props.brand.palette.ink,
  '--template-muted': props.brand.palette.muted,
  '--template-accent': props.brand.palette.accent,
  '--template-accent-ink': props.brand.palette.accentInk,
  '--template-display': props.brand.type.display,
  '--template-body': props.brand.type.body,
  '--template-transform': props.brand.type.transform,
}))
</script>

<style scoped src="./scene-one-preview.css" />
