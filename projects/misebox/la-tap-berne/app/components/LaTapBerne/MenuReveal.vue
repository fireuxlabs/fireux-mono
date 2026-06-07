<template>
  <div class="menu-reveal">
    <Transition name="accent-wash">
      <div v-if="isOpen" class="menu-reveal__accent" />
    </Transition>

    <div class="menu-reveal__action">
      <UButton
        size="xl"
        color="primary"
        variant="solid"
        icon="i-lucide-utensils"
        @click="isOpen = true"
      >
        Open menu
      </UButton>
    </div>

    <Transition name="menu-pop">
      <section v-if="isOpen" class="menu-reveal__panel" aria-label="La Tap Berne menu">
        <p class="menu-reveal__eyebrow">
          La Tap Berne
        </p>
        <h1>Comida Casera</h1>

        <LaTapBerneMenu />

        <div class="menu-reveal__actions">
          <UButton
            size="xl"
            color="neutral"
            variant="ghost"
            @click="isOpen = false"
          >
            Close
          </UButton>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
</script>

<style scoped>
.menu-reveal {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.menu-reveal__accent {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: color-mix(in srgb, var(--brand-accent) 80%, transparent);
}

.menu-reveal__action {
  position: absolute;
  inset-inline: 0;
  bottom: clamp(5rem, 12vw, 8rem);
  z-index: 2;
  display: flex;
  justify-content: center;
  pointer-events: auto;
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

.menu-reveal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  padding-top: 0.25rem;
}

@media (max-width: 720px) {
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
</style>
