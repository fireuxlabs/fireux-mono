<template>
  <div class="menu-reveal">
    <Transition name="accent-wash">
      <div v-if="isOpen" class="menu-reveal__accent" />
    </Transition>

    <Transition name="content-fade">
      <div v-if="!isOpen" class="menu-reveal__content">
        <UButton
          class="menu-reveal__button"
          size="xl"
          color="neutral"
          variant="ghost"
          icon="i-ph-fork-knife"
          @click="openMenu"
        >
          <span class="menu-reveal__button-copy">
            <span>View menu</span>
            <small>Comida Casera</small>
          </span>
        </UButton>
      </div>
    </Transition>

    <Transition name="content-fade">
      <LaTapBerneMiniMenu v-if="!isOpen" />
    </Transition>

    <Transition name="menu-pop">
      <section v-if="isOpen" class="menu-reveal__panel" aria-label="La Tap Berne menu">
        <button
          class="menu-reveal__close"
          type="button"
          aria-label="Close menu"
          @click="closeMenu"
        >
          <UIcon name="i-ph-x" />
        </button>

        <p class="menu-reveal__eyebrow">
          La Tap Berne
        </p>
        <h1>Comida Casera</h1>

        <LaTapBerneMenu />
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useMiseboxTenantChrome } from 'fireux-misebox/runtime/composables/fireux/app/useMiseboxTenantChrome'

const { setChromeHidden } = useMiseboxTenantChrome()
const isOpen = ref(false)

const openMenu = () => {
  isOpen.value = true
  setChromeHidden(true)
}

const closeMenu = () => {
  isOpen.value = false
  setChromeHidden(false)
}

onBeforeUnmount(() => {
  setChromeHidden(false)
})
</script>

<style scoped>
.menu-reveal {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
}

.menu-reveal__accent {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: color-mix(in srgb, var(--brand-accent) 87%, transparent);
}

.menu-reveal__content {
  position: absolute;
  inset-inline: 0;
  top: 25%;
  z-index: 2;
  display: flex;
  justify-content: center;
  pointer-events: auto;
  transform: translateY(-50%);
}

:global(.menu-reveal__button) {
  justify-content: flex-start;
  min-height: 4.25rem;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  border: 1px solid color-mix(in srgb, var(--brand-canvas) 68%, transparent);
  border-radius: 0.95rem;
  background: color-mix(in srgb, var(--brand-ink) 18%, transparent);
  color: var(--brand-canvas);
  box-shadow: 0 1rem 2.8rem rgb(42 14 7 / 28%);
  transform: translateZ(0);
  backdrop-filter: blur(16px);
  transition:
    border-color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

:global(.menu-reveal__button:hover) {
  border-color: color-mix(in srgb, var(--brand-canvas) 84%, transparent);
  background: color-mix(in srgb, var(--brand-ink) 26%, transparent);
  box-shadow: 0 1.3rem 3rem rgb(42 14 7 / 34%);
  transform: translateY(-2px);
}

.menu-reveal__button-copy {
  display: grid;
  gap: 0.12rem;
  min-width: 8rem;
  text-align: left;
}

.menu-reveal__button-copy span {
  font-size: 0.92rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.menu-reveal__button-copy small {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.9rem;
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1;
  opacity: 0.84;
}

:global(.menu-reveal__button .iconify) {
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
}

.menu-reveal__panel {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  align-content: start;
  gap: clamp(0.9rem, 2vw, 1.4rem);
  padding: clamp(6rem, 10vw, 8rem) clamp(1.5rem, 5vw, 5rem) clamp(4rem, 7vw, 6rem);
  color: var(--brand-ink);
  text-align: center;
  pointer-events: auto;
  overflow: auto;
}

.menu-reveal__close {
  position: fixed;
  top: clamp(1rem, 3vw, 2rem);
  right: clamp(1rem, 3vw, 2rem);
  z-index: 4;
  display: grid;
  width: 3.25rem;
  height: 3.25rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--brand-ink);
  cursor: pointer;
  place-items: center;
  filter: drop-shadow(0 0.45rem 0.9rem rgb(42 14 7 / 22%));
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.menu-reveal__close:hover {
  opacity: 0.72;
  transform: scale(1.04);
}

.menu-reveal__close :deep(.iconify) {
  width: 2.1rem;
  height: 2.1rem;
}

.menu-reveal__eyebrow {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.menu-reveal__panel h1 {
  max-width: none;
  margin: 0 auto;
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 900;
  letter-spacing: -0.08em;
  line-height: 0.86;
}

@media (max-width: 720px) {
  .menu-reveal__content {
    top: 25%;
  }

  .menu-reveal__panel {
    align-content: start;
    padding-top: 7rem;
  }
}

.accent-wash-enter-active,
.accent-wash-leave-active {
  transition: opacity 240ms ease;
}

.accent-wash-enter-from,
.accent-wash-leave-to {
  opacity: 0;
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition:
    opacity 260ms ease,
    transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(1.5rem) scale(0.94);
}

.content-fade-enter-active,
.content-fade-leave-active {
  transition: opacity 180ms ease;
}

.content-fade-enter-from,
.content-fade-leave-to {
  opacity: 0;
}
</style>
