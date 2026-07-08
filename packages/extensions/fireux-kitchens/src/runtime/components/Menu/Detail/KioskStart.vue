<template>
  <section class="kiosk-start" aria-label="Kiosk start screen">
    <div class="kiosk-start__media" aria-hidden="true">
      <article
        v-for="(item, index) in heroItems"
        :key="item.id"
        class="kiosk-start__tile"
        :class="`kiosk-start__tile--${index + 1}`"
      >
        <img
          v-if="item.imageUrl"
          :src="item.imageUrl"
          :alt="item.name"
        >
        <div v-else class="kiosk-start__tile-fallback">
          {{ item.name }}
        </div>
      </article>
    </div>

    <div class="kiosk-start__content">
      <p class="kiosk-start__kitchen">{{ menu.presentation.kitchenName }}</p>
      <h1>{{ menu.content.name }}</h1>
      <p v-if="menu.content.description" class="kiosk-start__description">
        {{ menu.content.description }}
      </p>

      <button
        type="button"
        class="kiosk-start__button"
        @click="$emit('start')"
      >
        Order
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuManifest,
  MenuManifestItem,
} from '../../../models/kitchen/menu/menu-detail.model'
import curryImage from '../../../assets/images/kiosk/indian-curry.png'
import grillImage from '../../../assets/images/kiosk/indian-grill.png'
import thaliImage from '../../../assets/images/kiosk/indian-thali.png'

const props = defineProps<{
  menu: MenuManifest
}>()

defineEmits<{
  (event: 'start'): void
}>()

type KioskHeroItem = Pick<MenuManifestItem, 'id' | 'name' | 'imageUrl'>

const fallbackHeroItems: KioskHeroItem[] = [
  {
    id: 'kiosk-curry',
    name: 'Fresh curry',
    imageUrl: curryImage,
  },
  {
    id: 'kiosk-grill',
    name: 'Tandoori grill',
    imageUrl: grillImage,
  },
  {
    id: 'kiosk-thali',
    name: 'Vegetarian thali',
    imageUrl: thaliImage,
  },
]

const heroItems = computed<KioskHeroItem[]>(() => {
  const itemPhotos = props.menu.content.sections
    .flatMap((section) => section.items)
    .filter((item) => item.imageUrl)
    .map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
    }))

  return [...itemPhotos, ...fallbackHeroItems].slice(0, 5)
})
</script>

<style scoped>
.kiosk-start {
  position: relative;
  display: grid;
  min-height: 100svh;
  place-items: center;
  overflow: hidden;
  padding: clamp(1.5rem, 4vw, 4rem);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--menu-bg) 84%, var(--menu-primary)),
      var(--menu-bg) 46%,
      color-mix(in srgb, var(--menu-bg) 76%, var(--menu-text))
    );
  color: var(--menu-text);
}

.kiosk-start__media {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.kiosk-start__media::after {
  position: absolute;
  inset: 0;
  content: "";
  background:
    linear-gradient(
      90deg,
      rgb(0 0 0 / 34%),
      rgb(0 0 0 / 8%) 42%,
      rgb(0 0 0 / 42%)
    ),
    linear-gradient(
      180deg,
      rgb(0 0 0 / 24%),
      transparent 32%,
      rgb(0 0 0 / 22%)
    );
}

.kiosk-start__tile {
  position: absolute;
  overflow: hidden;
  width: clamp(12rem, 24vw, 23rem);
  aspect-ratio: 4 / 5;
  border-radius: min(5vw, 2rem);
  background: color-mix(in srgb, var(--menu-text) 10%, var(--menu-bg));
  box-shadow: 0 1.25rem 4rem rgb(0 0 0 / 24%);
  animation: kiosk-float 9s ease-in-out infinite;
}

.kiosk-start__tile img,
.kiosk-start__tile-fallback {
  display: block;
  width: 100%;
  height: 100%;
}

.kiosk-start__tile img {
  object-fit: cover;
}

.kiosk-start__tile-fallback {
  display: grid;
  place-items: center;
  padding: 1rem;
  color: var(--menu-title);
  font-size: 1.25rem;
  font-weight: 900;
  text-align: center;
}

.kiosk-start__tile--1 {
  top: 6%;
  left: 5%;
  transform: rotate(-8deg);
}

.kiosk-start__tile--2 {
  top: 13%;
  right: 7%;
  animation-delay: -1.8s;
  transform: rotate(7deg);
}

.kiosk-start__tile--3 {
  bottom: 8%;
  left: 12%;
  animation-delay: -3.4s;
  transform: rotate(5deg);
}

.kiosk-start__tile--4 {
  right: 18%;
  bottom: 5%;
  animation-delay: -5.2s;
  transform: rotate(-6deg);
}

.kiosk-start__tile--5 {
  top: 35%;
  right: 39%;
  width: clamp(9rem, 16vw, 15rem);
  animation-delay: -6.8s;
  transform: rotate(10deg);
}

.kiosk-start__content {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  width: min(100%, 42rem);
  gap: 1rem;
  text-align: center;
}

.kiosk-start__kitchen,
.kiosk-start__description,
.kiosk-start h1 {
  margin: 0;
}

.kiosk-start__kitchen {
  color: var(--menu-primary);
  font-size: clamp(1rem, 1.8vw, 1.35rem);
  font-weight: 950;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.kiosk-start h1 {
  max-width: 12ch;
  color: var(--menu-title);
  font-size: clamp(3.4rem, 10vw, 8.5rem);
  font-weight: 950;
  line-height: 0.9;
}

.kiosk-start__description {
  max-width: 32rem;
  color: var(--menu-muted);
  font-size: clamp(1.1rem, 2vw, 1.55rem);
  font-weight: 750;
  line-height: 1.35;
}

.kiosk-start__button {
  display: inline-grid;
  min-width: min(18rem, 78vw);
  min-height: 5.4rem;
  margin-top: 1.5rem;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-size: clamp(1.55rem, 4vw, 2.5rem);
  font-weight: 950;
  box-shadow: 0 1.2rem 2.8rem color-mix(in srgb, var(--menu-primary) 32%, transparent);
  animation: kiosk-button-pulse 1.8s ease-in-out infinite;
}

.kiosk-start__button:hover,
.kiosk-start__button:focus-visible {
  transform: translateY(-0.12rem) scale(1.02);
}

.kiosk-start__button:focus-visible {
  outline: 0.25rem solid color-mix(in srgb, var(--menu-bg) 82%, transparent);
  outline-offset: 0.3rem;
}

@keyframes kiosk-float {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -1.1rem;
  }
}

@keyframes kiosk-button-pulse {
  0%,
  100% {
    scale: 1;
  }

  50% {
    scale: 1.035;
  }
}

@media (max-width: 720px) {
  .kiosk-start__tile {
    opacity: 0.76;
  }

  .kiosk-start__tile--5 {
    display: none;
  }
}
</style>
