<template>
  <div class="alpine-scene__outro" aria-hidden="true">
    <p class="alpine-scene__eyebrow">All year in the mountains</p>
    <p class="alpine-scene__statement">Summer &amp;<br /><em>winter</em></p>
    <p class="alpine-scene__caption">Activities · Courses · Private guiding</p>
  </div>
</template>

<style scoped>
.alpine-scene__outro {
  position: absolute;
  left: clamp(24px, 7vw, 110px);
  right: 24px;
  max-width: 1000px;
  top: 43%;
  opacity: var(--scene-outro-opacity, 0);
  transform: translate3d(0, calc((1 - var(--scene-progress, 0)) * 55px), 0);
  pointer-events: none;
}
.alpine-scene__eyebrow {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  line-height: 1.7;
  margin: 0 0 22px;
}
.alpine-scene__statement {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(55px, 7.2vw, 110px);
  line-height: 0.95;
  font-weight: 400;
  letter-spacing: -0.055em;
  margin: 0;
  text-shadow: 0 3px 35px #17364b25;
}
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
@media (min-width: 800px) {
  .alpine-scene__caption {
    font-size: 15px;
  }
  .alpine-scene__eyebrow {
    font-size: 10px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .alpine-scene__outro {
    display: none;
  }
}
</style>
