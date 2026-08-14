<template>
  <UPage class="template-one-page" :style="themeStyle">
    <main id="top">
      <TemplateOneSceneOne
        :name="projection.name"
        :wordmark-src="projection.wordmarkSrc"
        :place-primary-color="projection.placePrimaryColor"
        :identity-alignment="projection.hero.identityAlignment"
        :tagline="projection.hero.tagline"
        :palette="projection.palette"
        :typography="projection.typography"
        :flagship-dish="projection.flagshipDish"
        :product-crop="projection.hero.productCrop"
        :requirements="projection.requirements"
        menu-to="#menu"
      />
      <TemplateOneMenuSection
        :content="projection.menu"
        :palette="projection.palette"
        :typography="projection.typography"
      />
      <TemplateOneOrderingScene :content="projection.ordering" />
      <TemplateOneFranchiseScene :content="projection.franchise" />
      <TemplateOneProviderScene :content="projection.provider" />
      <TemplateOneFooterScene
        :name="projection.name"
        :wordmark-src="projection.wordmarkSrc"
        :provider="projection.provider"
        :content="projection.footer"
      />
    </main>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TemplateOneKitchenProjection } from './template-one'
import TemplateOneFooterScene from './TemplateOneFooterScene.vue'
import TemplateOneFranchiseScene from './TemplateOneFranchiseScene.vue'
import TemplateOneMenuSection from './TemplateOneMenuSection.vue'
import TemplateOneOrderingScene from './TemplateOneOrderingScene.vue'
import TemplateOneProviderScene from './TemplateOneProviderScene.vue'
import TemplateOneSceneOne from './TemplateOneSceneOne.vue'

const props = defineProps<{ projection: TemplateOneKitchenProjection }>()
const themeStyle = computed(() => ({
  '--template-one-canvas': props.projection.palette.canvas,
  '--template-one-surface': props.projection.palette.surface,
  '--template-one-inverted': props.projection.palette.canvas_inverted,
  '--template-one-text': props.projection.palette.text,
  '--template-one-muted': props.projection.palette.text_muted,
  '--template-one-ink': props.projection.palette.ink,
  '--template-one-accent': props.projection.palette.accent,
  '--template-one-accent-contrast': props.projection.palette.accent_contrast,
  '--template-one-display-family': props.projection.typography.display_family,
  '--template-one-body-family': props.projection.typography.body_family,
}))
</script>

<style src="./styles/template-one-page.css"></style>
