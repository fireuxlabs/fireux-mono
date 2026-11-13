<template>
  <section ref="hero" class="alpine-scene" aria-labelledby="hero-title">
    <div class="alpine-scene__stage" data-mountain-stage>
      <img
        class="alpine-scene__poster"
        src="/img/landing/ascent-poster.webp"
        alt="Snow-covered Alpine summits in soft morning light"
        width="864"
        height="1536"
        fetchpriority="high"
        decoding="async"
      />
      <video
        ref="video"
        class="alpine-scene__video"
        :class="{ 'alpine-scene__video--active': videoActive }"
        muted
        playsinline
        preload="metadata"
        disablepictureinpicture
        tabindex="-1"
        aria-hidden="true"
        width="720"
        height="1280"
      >
        <source src="/img/landing/ascent-scroll.mp4" type="video/mp4" />
      </video>
      <div class="alpine-scene__shade" aria-hidden="true" />
      <div class="alpine-scene__intro">
        <p class="alpine-scene__eyebrow">Mountain guide school</p>
        <h1 id="hero-title">Swiss Alpine<br /><em>Guides</em></h1>
        <p class="alpine-scene__caption">Interlaken · Switzerland</p>
      </div>
      <div class="alpine-scene__outro" aria-hidden="true">
        <p class="alpine-scene__eyebrow">All year in the mountains</p>
        <p class="alpine-scene__statement">
          Summer &amp;<br /><em>winter</em>
        </p>
        <p class="alpine-scene__caption">
          Activities · Courses · Private guiding
        </p>
      </div>
      <a
        class="alpine-scene__scroll"
        href="#activities"
        aria-label="Explore the activities"
        ><span aria-hidden="true">↓</span></a
      >
    </div>
  </section>
</template>
<script setup lang="ts">
const hero = ref<HTMLElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
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
  --scene-viewport: max(calc(100svh - var(--ui-header-height, 4rem)), 560px);
  --scene-media-height: max(calc(var(--scene-viewport) * 1.52), 177.777778vw);
  position: sticky;
  top: var(--ui-header-height, 4rem);
  height: calc(100svh - var(--ui-header-height, 4rem));
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
.alpine-scene__poster,
.alpine-scene__video {
  position: absolute;
  top: calc(var(--scene-viewport) * 0.04 - var(--scene-media-height) * 0.368);
  left: calc((100% - var(--scene-media-height) * 0.5625) * 0.75);
  width: calc(var(--scene-media-height) * 0.5625);
  height: var(--scene-media-height);
  max-width: none;
  object-fit: cover;
  object-position: 75% 50%;
  pointer-events: none;
}
.alpine-scene__video {
  opacity: 0;
}
.alpine-scene__video--active {
  opacity: 1;
}
.alpine-scene__shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      #102d4266 0%,
      #17334918 42%,
      #06253700 62%,
      #07233470 100%
    ),
    linear-gradient(90deg, #0b263d25, transparent 80%);
  pointer-events: none;
}
.alpine-scene__intro,
.alpine-scene__outro {
  position: absolute;
  left: clamp(24px, 7vw, 110px);
  right: 24px;
  max-width: 1000px;
}
.alpine-scene__intro {
  top: 25%;
  opacity: var(--scene-intro-opacity, 0);
  transform: translate3d(0, calc(var(--scene-travel, 0px) * -0.17), 0);
}
.alpine-scene__eyebrow {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  line-height: 1.7;
  margin: 0 0 22px;
}
.alpine-scene h1,
.alpine-scene__statement {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(42px, 7.5vw, 112px);
  line-height: 0.95;
  font-weight: 400;
  letter-spacing: -0.055em;
  margin: 0;
  text-shadow: 0 3px 35px #17364b25;
}
.alpine-scene h1 em,
.alpine-scene__statement em {
  font-weight: 400;
  color: #f5e4c8;
}
.alpine-scene__caption {
  font-size: 12px;
  line-height: 1.7;
  letter-spacing: 0.025em;
  margin: 28px 0 0;
  color: #f2f5f6;
}
.alpine-scene__outro {
  top: 43%;
  opacity: var(--scene-outro-opacity, 0);
  transform: translate3d(0, calc((1 - var(--scene-progress, 0)) * 55px), 0);
  pointer-events: none;
}
.alpine-scene__statement {
  font-size: clamp(55px, 7.2vw, 110px);
}
.alpine-scene__scroll {
  position: absolute;
  bottom: 40px;
  left: clamp(24px, 7vw, 110px);
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.alpine-scene__scroll:focus-visible {
  opacity: 1;
  outline: 2px solid currentColor;
  outline-offset: 8px;
}
.alpine-scene__scroll > span:last-child {
  font-size: 22px;
  font-weight: 200;
}
@media (min-width: 800px) {
  .alpine-scene__intro {
    top: 26%;
  }
  .alpine-scene__caption {
    font-size: 15px;
  }
  .alpine-scene__eyebrow {
    font-size: 10px;
  }
}
@media (max-width: 380px) {
  .alpine-scene h1 {
    font-size: 40px;
  }
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
  .alpine-scene__video {
    display: none;
  }
  .alpine-scene__shade {
    bottom: auto;
    height: var(--scene-viewport);
  }
  .alpine-scene__intro {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    margin-top: var(--scene-viewport);
    padding: 48px 24px 64px;
    opacity: 1;
    transform: none;
  }
  .alpine-scene__outro,
  .alpine-scene__scroll {
    display: none;
  }
}
</style>
