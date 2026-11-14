<template>
  <div class="alpine-scene__intro">
    <p class="alpine-scene__eyebrow">Mountain guide school</p>
    <h1 id="hero-title">Swiss Alpine<br /><em>Guides</em></h1>
    <p class="alpine-scene__caption">Interlaken · Switzerland</p>
  </div>
</template>

<style scoped>
.alpine-scene__intro {
  position: absolute;
  left: clamp(24px, 7vw, 110px);
  right: 24px;
  max-width: 1000px;
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
.alpine-scene__intro h1 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(42px, 7.5vw, 112px);
  line-height: 0.95;
  font-weight: 400;
  letter-spacing: -0.055em;
  margin: 0;
  text-shadow: 0 3px 35px #17364b25;
}
.alpine-scene__intro h1 em {
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
  .alpine-scene__intro h1 {
    font-size: 40px;
  }
}
@media (prefers-reduced-motion: reduce) {
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
}
</style>
