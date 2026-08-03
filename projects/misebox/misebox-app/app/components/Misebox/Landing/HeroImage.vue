<template>
  <figure class="misebox-landing-hero-image">
    <img
      src="/img/landing/kitchen-operations-hero-v2.png"
      width="1692"
      height="929"
      alt="Deanos menu kiosk, Misebox Mise en place Console and a delivery order confirmation"
      decoding="async"
      fetchpriority="high"
    />
  </figure>
</template>

<style scoped>
.misebox-landing-hero-image {
  position: relative;
  isolation: isolate;
  width: 100%;
  margin: 0;
}

.misebox-landing-hero-image::before {
  position: absolute;
  z-index: 0;
  inset: calc(var(--spacing) * -6);
  background: url('/img/landing/kitchen-operations-hero-v2.png') center / cover
    no-repeat;
  content: '';
  filter: blur(calc(var(--spacing) * 6));
  mask-image: radial-gradient(ellipse at center, black 42%, transparent 82%);
  opacity: 0.42;
  pointer-events: none;
}

.misebox-landing-hero-image::after {
  position: absolute;
  z-index: 2;
  inset: -1px;
  background:
    linear-gradient(
      to right,
      var(--ui-bg) 0,
      transparent 10%,
      transparent 92%,
      var(--ui-bg) 100%
    ),
    linear-gradient(
      to bottom,
      var(--ui-bg) 0,
      transparent 8%,
      transparent 92%,
      var(--ui-bg) 100%
    );
  content: '';
  pointer-events: none;
}

.misebox-landing-hero-image img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: auto;
}
</style>
