<template>
  <section ref="hero" class="alpine-scene" aria-labelledby="hero-title">
    <div class="alpine-scene__stage" data-mountain-stage>
      <LandingHeroMedia ref="media" :active="videoActive" />
      <LandingHeroIntroduction />
      <LandingHeroClosing />
      <LandingHeroScroll />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

const hero = ref<HTMLElement | null>(null)
const media = useTemplateRef('media')
const video = computed(() => media.value?.video ?? null)
const { videoActive } = useMountainMotion(hero, video)
</script>

<style scoped>
.alpine-scene {
  position: relative;
  height: 235svh;
  background: #f3f3ef;
  color: #fff;
  isolation: isolate;
}
.alpine-scene__stage {
  --scene-viewport: max(100svh, 560px);
  --scene-media-height: max(calc(var(--scene-viewport) * 1.52), 177.777778vw);
  position: sticky;
  top: 0;
  height: 100svh;
  min-height: 560px;
  overflow: hidden;
  background: #5b7b90;
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0,
    #000 calc(100% - var(--scene-feather, 0px)),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    #000 0,
    #000 calc(100% - var(--scene-feather, 0px)),
    transparent 100%
  );
}
@media (prefers-reduced-motion: reduce) {
  .alpine-scene {
    height: auto;
  }
  .alpine-scene__stage {
    position: relative;
    top: 0;
    height: auto;
    -webkit-mask-image: none;
    mask-image: none;
  }
}
</style>
