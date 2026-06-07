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

        <div class="menu-reveal__menu" aria-label="Menu sections">
          <section
            v-for="section in menuSections"
            :key="section.label"
            class="menu-section"
          >
            <h2>{{ section.label }}</h2>

            <article
              v-for="item in section.items"
              :key="item.name"
              class="menu-item"
            >
              <div class="menu-item__copy">
                <h3>{{ item.name }}</h3>
                <p v-if="item.description">
                  {{ item.description }}
                </p>
              </div>
              <p class="menu-item__price">
                {{ item.price }}
              </p>
            </article>
          </section>
        </div>

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
import { laTapBerneMenuSections } from '../../menu'

const isOpen = ref(false)
const menuSections = laTapBerneMenuSections
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
  align-content: center;
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

.menu-reveal__menu {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 2rem);
  width: min(94rem, 100%);
  margin: 0 auto;
  padding-top: clamp(0.5rem, 1.5vw, 1rem);
  text-align: left;
}

.menu-section {
  display: grid;
  gap: 0.7rem;
  align-content: start;
}

.menu-section h2 {
  margin: 0;
  color: var(--brand-primary);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.menu-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-ink) 18%, transparent);
}

.menu-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.menu-item__copy {
  display: grid;
  gap: 0.2rem;
}

.menu-item h3,
.menu-item p {
  margin: 0;
}

.menu-item h3 {
  font-size: clamp(1rem, 2.4vw, 1.3rem);
  font-weight: 850;
  letter-spacing: -0.03em;
}

.menu-item__copy p {
  color: color-mix(in srgb, var(--brand-ink) 72%, transparent);
  font-size: 0.9rem;
  line-height: 1.35;
}

.menu-item__price {
  font-size: 0.95rem;
  font-weight: 850;
  white-space: nowrap;
}

.menu-reveal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  padding-top: 0.25rem;
}

@media (max-width: 1100px) {
  .menu-reveal__menu {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .menu-reveal__panel {
    align-content: start;
    padding-top: 7rem;
  }

  .menu-reveal__menu {
    grid-template-columns: 1fr;
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
