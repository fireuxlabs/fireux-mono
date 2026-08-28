<template>
  <UPage class="template-one-page" :style="themeStyle">
    <main id="top" ref="landingRoot">
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
import { computed, useTemplateRef } from 'vue'
import { useLandingMotion } from 'fireux-core/runtime/composables/fireux/motion/useLandingMotion'
import type { TemplateOneKitchenProjection } from '../../models/template-one'
import TemplateOneFooterScene from './FooterScene.vue'
import TemplateOneFranchiseScene from './FranchiseScene.vue'
import TemplateOneMenuSection from './MenuSection.vue'
import TemplateOneOrderingScene from './OrderingScene.vue'
import TemplateOneProviderScene from './ProviderScene.vue'
import TemplateOneSceneOne from './SceneOne.vue'

const props = defineProps<{ projection: TemplateOneKitchenProjection }>()
const landingRoot = useTemplateRef<HTMLElement>('landingRoot')
useLandingMotion(landingRoot)
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

<style src="../../assets/styles/template-one-page.css"></style>
