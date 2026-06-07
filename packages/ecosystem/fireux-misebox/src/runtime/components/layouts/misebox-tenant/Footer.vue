<template>
  <footer v-if="!chromeHidden" class="misebox-tenant-footer">
    <a
      href="https://misebox.app"
      target="_blank"
      rel="noopener noreferrer"
      class="misebox-tenant-footer__powered"
      aria-label="Powered by Misebox"
    >
      <span>Powered by</span>
      <img
        src="/img/ecosystem/wordmark-light.svg"
        alt="Misebox"
        class="misebox-tenant-footer__wordmark"
      >
    </a>
  </footer>
</template>

<script setup lang="ts">
import { useMiseboxTenantChrome } from '../../../composables/fireux/app/useMiseboxTenantChrome'

const { chromeHidden } = useMiseboxTenantChrome()
</script>

<style scoped>
.misebox-tenant-footer {
  position: absolute;
  right: clamp(1rem, 3vw, 2rem);
  bottom: clamp(1rem, 3vw, 2rem);
  left: clamp(1rem, 3vw, 2rem);
  z-index: 2;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.misebox-tenant-footer__powered {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: fit-content;
  padding: 0.4rem 0.15rem;
  color: var(--brand-canvas, white);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  line-height: 1;
  text-decoration: none;
  text-transform: uppercase;
  text-shadow: 0 0.2rem 1.4rem rgb(42 14 7 / 70%);
  opacity: 0.9;
  pointer-events: auto;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.misebox-tenant-footer__powered:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.misebox-tenant-footer__wordmark {
  display: block;
  width: auto;
  height: 1.05rem;
  filter: drop-shadow(0 0.2rem 1.4rem rgb(42 14 7 / 60%));
}
</style>
