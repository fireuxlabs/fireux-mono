<template>
  <section class="baeren-hero">
    <div
      class="baeren-hero__backdrop"
      :style="backdropStyle"
      aria-hidden="true"
    />

    <div class="baeren-hero__content mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <BaerenHomeWelcome />
    </div>
  </section>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../../../config/content.config'

const scrollNudgeKey = 'baeren-home-scroll-nudge'
const backdropStyle = {
  backgroundImage: `url("${baerenRinggenbergContent.assets.backdrop.src}")`,
}
let scrollNudgeTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  const shouldSkip =
    window.location.hash.length > 0 ||
    window.scrollY > 8 ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    sessionStorage.getItem(scrollNudgeKey) === 'done'

  if (shouldSkip) return

  scrollNudgeTimer = setTimeout(() => {
    if (window.scrollY > 8) return

    sessionStorage.setItem(scrollNudgeKey, 'done')
    window.scrollTo({
      top: Math.min(window.innerHeight * 0.28, 220),
      behavior: 'smooth',
    })
  }, 900)
})

onBeforeUnmount(() => {
  if (scrollNudgeTimer) clearTimeout(scrollNudgeTimer)
})
</script>

<style scoped>
.baeren-hero {
  position: relative;
  width: 100vw;
  margin-block-start: calc(var(--spacing-m) * -1);
  margin-inline-start: calc(50% - 50vw);
}

.baeren-hero__backdrop {
  position: sticky;
  top: 0;
  height: 100svh;
  background-position: center;
  background-size: cover;
}

.baeren-hero__content {
  position: relative;
  z-index: 1;
  margin-block-start: -100svh;
  padding-block-start: calc(100svh + 4rem);
  padding-block-end: 8rem;
}
</style>
