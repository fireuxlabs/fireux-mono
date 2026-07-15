<template>
  <section
    ref="sectionEl"
    class="baeren-home-surfaces"
    aria-labelledby="baeren-home-routes-title"
  >
    <div class="baeren-home-surfaces__inner">
      <header class="baeren-home-surfaces__header" data-scroll-reveal>
        <p>{{ home.directory.eyebrow }}</p>
        <h2 id="baeren-home-routes-title">{{ home.directory.title }}</h2>
        <span>{{ home.directory.copy }}</span>
      </header>

      <div class="baeren-home-surfaces__grid">
        <div
          v-for="route in home.routes"
          :key="route.key"
          class="baeren-home-surfaces__item"
          :class="{ 'baeren-home-surfaces__item--featured': route.featured }"
          :data-route="route.key"
          data-scroll-reveal
        >
          <BaerenHomeRouteCard :surface="route" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { baerenRinggenbergContent } from '../../../config/content.config'

defineOptions({ name: 'BaerenHomeSurfaces' })

const home = baerenRinggenbergContent.pages.home
const sectionEl = ref<HTMLElement | null>(null)

let revealObserver: IntersectionObserver | null = null

onMounted(() => {
  const section = sectionEl.value

  if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const targets = Array.from(section.querySelectorAll('[data-scroll-reveal]')) as HTMLElement[]

  section.classList.add('baeren-home-surfaces--motion-ready')
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return
      }

      entry.target.classList.add('is-visible')
      revealObserver?.unobserve(entry.target)
    })
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -7% 0px',
  })

  requestAnimationFrame(() => {
    targets.forEach(target => revealObserver?.observe(target))
  })
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
})
</script>

<style scoped>
.baeren-home-surfaces {
  overflow: clip;
  background:
    radial-gradient(circle at 100% 0%, rgb(var(--baeren-accent-rgb) / 10%), transparent 28rem),
    var(--baeren-canvas);
  color: var(--baeren-ink);
  padding: 3.75rem 1rem calc(10rem + env(safe-area-inset-bottom));
}

.baeren-home-surfaces__inner {
  display: grid;
  gap: 2rem;
  width: min(100%, 80rem);
  margin-inline: auto;
}

.baeren-home-surfaces__header {
  display: grid;
  gap: 0.65rem;
  max-width: 42rem;
}

.baeren-home-surfaces__header p,
.baeren-home-surfaces__header h2,
.baeren-home-surfaces__header span {
  margin: 0;
}

.baeren-home-surfaces__header p {
  color: var(--baeren-accent);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.baeren-home-surfaces__header h2 {
  max-width: 16ch;
  font-size: clamp(2.1rem, 10vw, 3.5rem);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: -0.045em;
  text-wrap: balance;
}

.baeren-home-surfaces__header span {
  max-width: 42rem;
  color: var(--baeren-ink-muted);
  font-size: 1rem;
  line-height: 1.6;
}

.baeren-home-surfaces__grid {
  display: grid;
  gap: 0.75rem;
}

.baeren-home-surfaces__item {
  min-width: 0;
}

.baeren-home-surfaces__item :deep(.baeren-home-route-card) {
  height: 100%;
}

.baeren-home-surfaces--motion-ready [data-scroll-reveal] {
  --reveal-x: -1rem;
  opacity: 0;
  transform: translate3d(var(--reveal-x), 1.35rem, 0) scale(0.985);
  transition:
    opacity 620ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}

.baeren-home-surfaces--motion-ready .baeren-home-surfaces__header {
  --reveal-x: 0;
}

.baeren-home-surfaces--motion-ready .baeren-home-surfaces__item:nth-child(even) {
  --reveal-x: 1rem;
}

.baeren-home-surfaces--motion-ready .baeren-home-surfaces__item:nth-child(3n + 2) {
  transition-delay: 45ms;
}

.baeren-home-surfaces--motion-ready .baeren-home-surfaces__item:nth-child(3n) {
  transition-delay: 90ms;
}

.baeren-home-surfaces--motion-ready [data-scroll-reveal].is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  will-change: auto;
}

@media (min-width: 23rem) {
  .baeren-home-surfaces__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .baeren-home-surfaces__item--featured {
    grid-column: 1 / -1;
  }
}

@media (min-width: 40rem) {
  .baeren-home-surfaces {
    padding-inline: 1.5rem;
  }

  .baeren-home-surfaces__grid {
    gap: 1rem;
  }
}

@media (min-width: 64rem) {
  .baeren-home-surfaces {
    padding-block: 7rem 12rem;
  }

  .baeren-home-surfaces__inner {
    gap: 3.5rem;
  }

  .baeren-home-surfaces__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .baeren-home-surfaces__item {
    grid-column: span 4;
  }

  .baeren-home-surfaces__item[data-route='hotel'] {
    grid-column: span 7;
  }

  .baeren-home-surfaces__item[data-route='menu'] {
    grid-column: span 5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .baeren-home-surfaces--motion-ready [data-scroll-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
