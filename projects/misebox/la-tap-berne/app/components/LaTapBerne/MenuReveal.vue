<template>
  <div class="menu-reveal">
    <Transition name="accent-wash">
      <div v-if="isOpen" class="menu-reveal__accent" />
    </Transition>

    <Transition name="content-fade">
      <div v-if="!isOpen" class="menu-reveal__content">
        <button
          class="menu-reveal__button latap-glass-button"
          type="button"
          @click="openMenu"
        >
          <UIcon name="i-ph-fork-knife" />
          <span class="menu-reveal__button-copy">
            <span>View menu</span>
            <small>Comida Casera</small>
          </span>
        </button>
      </div>
    </Transition>

    <Transition name="menu-pop">
      <section
        v-if="isOpen"
        class="menu-reveal__panel"
        aria-label="La Tap Berne menu"
      >
        <button
          class="menu-reveal__close"
          type="button"
          aria-label="Close menu"
          @click="closeMenu"
        >
          <UIcon name="i-ph-x" />
        </button>

        <!-- TODO: Revisit popup feel; older landing used a lighter tenant-local menu renderer. -->
        <Menu menu-id="main" />
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useMiseboxTenantChrome } from 'fireux-misebox/runtime/composables/fireux/app/useMiseboxTenantChrome'
import { onBeforeUnmount, ref } from 'vue'

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
  background: color-mix(in srgb, var(--brand-accent-display) 87%, transparent);
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

.menu-reveal__button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 4.25rem;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  border-radius: 0.95rem;
  cursor: pointer;
  transform: translateZ(0);
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

.menu-reveal__button :deep(.iconify) {
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
  filter: drop-shadow(0 0.45rem 0.9rem color-mix(in srgb, var(--brand-ink) 22%, transparent));
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
