<template>
  <TemplateOneSceneOne
    name="Friiites"
    wordmark-src="/img/app/wordmark-dark.png"
    place-primary-color="#0b0b0a"
    identity-alignment="left"
    :tagline="['Hand-cut.', 'Brined.', 'Triple-fried', 'in beef tallow.']"
    :palette="palette"
    :typography="typography"
    :flagship-dish="flagshipResult?.dish || null"
    :product-crop="productCrop"
    :requirements="requirements"
    :show-action="false"
    :show-scroll-cue="false"
  />
</template>

<script setup lang="ts">
import TemplateOneSceneOne from 'fireux-misebox/runtime/TemplateOneSceneOne.vue'
import type { KitchenFlagshipDishResult } from 'fireux-kitchens/runtime/server/dish/flagship-projection'

const { data: flagshipResult } = await useFetch<KitchenFlagshipDishResult>(
  '/api/kitchens/5dGJgdjDv7Zi0tjva61O/flagship-dish',
  { query: { appId: 'friiites' } }
)
const palette = {
  canvas: '#181817', surface: '#242321', canvas_inverted: '#f3e9d2',
  text: '#f3e9d2', text_muted: '#bdb6a5', ink: '#181817',
  accent: '#d99a22', accent_contrast: '#181817',
}
const typography = {
  display_family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
  body_family: "'Arial Narrow', Arial, sans-serif",
}
const productCrop = {
  visibleAspect: 857 / 445,
  scale: 1200 / 857,
  offsetX: -(178 / 857) * 100,
  offsetY: -(387 / 445) * 100,
}
const requirements = computed(() => ({
  wordmark: true,
  palette: true,
  typography: true,
  flagshipDish: flagshipResult.value?.ready === true,
  pattern: 'unapproved' as const,
}))
</script>
