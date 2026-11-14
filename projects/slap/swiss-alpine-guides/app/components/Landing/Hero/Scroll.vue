<template>
  <a
    class="alpine-scene__scroll"
    href="#activities"
    aria-label="Explore the activities"
    ><span aria-hidden="true">↓</span></a
  >
</template>

<style scoped>
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
@media (prefers-reduced-motion: reduce) {
  .alpine-scene__scroll {
    display: none;
  }
}
</style>
