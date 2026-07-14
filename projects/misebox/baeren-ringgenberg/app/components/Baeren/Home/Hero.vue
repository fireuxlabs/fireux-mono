<template>
  <section ref="scrollRoot" class="baeren-home-scroll">
    <div class="baeren-home-scroll__photo" aria-hidden="true" />

    <div class="baeren-home-scroll__stages">
      <BaerenHomeTitle />
      <BaerenHomeSurfaces />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const scrollRoot = ref<HTMLElement | null>(null)
let maskFrame: number | undefined
let landingAssistTimer: number | undefined
let landingAssistFrame: number | undefined

const landingAssistEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const
const landingElementsDuration = 2800
const landingTitleDuration = 900
const landingTitleSpeed = landingElementsDuration / landingTitleDuration

const getTitleElement = () =>
  (scrollRoot.value?.querySelector('[data-baeren-home-title]') as HTMLElement | null) ?? null

const getSurfaceElements = () =>
  Array.from(
    scrollRoot.value?.querySelectorAll('[data-baeren-home-surface]') ?? []
  ) as HTMLElement[]

function removeLandingAssistListeners() {
  landingAssistEvents.forEach((eventName) => {
    window.removeEventListener(eventName, cancelLandingAssist)
  })
}

function clearLandingTitleLead() {
  getTitleElement()?.style.removeProperty('transform')
}

function settleEvenSurfaces() {
  getSurfaceElements().forEach((surface) => {
    if (surface.dataset.pairPosition === 'even') {
      surface.dataset.landingSettled = 'true'
    }
  })
}

function cancelLandingAssist() {
  if (landingAssistTimer !== undefined) {
    window.clearTimeout(landingAssistTimer)
    landingAssistTimer = undefined
  }

  if (landingAssistFrame !== undefined) {
    window.cancelAnimationFrame(landingAssistFrame)
    landingAssistFrame = undefined
  }

  removeLandingAssistListeners()
  clearLandingTitleLead()
}

function runLandingAssist() {
  landingAssistTimer = undefined

  if (
    window.scrollY > 4
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    removeLandingAssistListeners()
    return
  }

  const title = getTitleElement()
  const [firstSurface] = getSurfaceElements()
  if (!title || !firstSurface) {
    removeLandingAssistListeners()
    return
  }

  const stickyTop = Number.parseFloat(window.getComputedStyle(title).top) || 0
  const startTop = window.scrollY
  const titleStartTop = title.getBoundingClientRect().top
  const titleTravel = Math.max(0, titleStartTop - stickyTop)
  const targetTop = startTop + firstSurface.getBoundingClientRect().top - stickyTop

  if (targetTop <= startTop) {
    removeLandingAssistListeners()
    return
  }

  const travel = targetTop - startTop
  const pixelsPerMillisecond = travel / landingElementsDuration
  let currentTop = startTop
  let previousFrame: number | undefined

  const animate = (now: number) => {
    if (previousFrame === undefined) {
      previousFrame = now
      landingAssistFrame = window.requestAnimationFrame(animate)
      return
    }

    const frameDuration = Math.min(now - previousFrame, 32)
    previousFrame = now
    currentTop = Math.min(targetTop, currentTop + pixelsPerMillisecond * frameDuration)
    window.scrollTo(0, currentTop)

    const currentTravel = currentTop - startTop
    const scrollProgress = currentTravel / travel
    const titleProgress = Math.min(scrollProgress * landingTitleSpeed, 1)
    const naturalTitleTop = Math.max(stickyTop, titleStartTop - currentTravel)
    const targetTitleTop = titleStartTop - titleTravel * titleProgress
    const titleOffset = targetTitleTop - naturalTitleTop
    title.style.transform = `translate3d(0, ${titleOffset}px, 0)`

    if (currentTop < targetTop) {
      landingAssistFrame = window.requestAnimationFrame(animate)
      return
    }

    landingAssistFrame = undefined
    removeLandingAssistListeners()
    clearLandingTitleLead()
    settleEvenSurfaces()
  }

  landingAssistFrame = window.requestAnimationFrame(animate)
}

function updateSurfaceMasks() {
  maskFrame = undefined

  const title = getTitleElement()
  if (!title) return

  const maskEverySurface = window.matchMedia('(max-width: 640px)').matches
  const boundary = title.getBoundingClientRect().bottom + 20

  getSurfaceElements().forEach((surface) => {
    const shouldMask = maskEverySurface || surface.dataset.side === 'left'

    if (!shouldMask) {
      surface.removeAttribute('data-clipping')
      surface.style.removeProperty('--baeren-surface-clip')
      return
    }

    const rect = surface.getBoundingClientRect()
    const clip = Math.max(0, Math.min(rect.height + 24, boundary - rect.top))

    if (clip <= 0) {
      surface.removeAttribute('data-clipping')
      surface.style.removeProperty('--baeren-surface-clip')
      return
    }

    surface.dataset.clipping = 'true'
    surface.style.setProperty('--baeren-surface-clip', `${clip}px`)
  })
}

function scheduleSurfaceMasks() {
  if (maskFrame !== undefined) return
  maskFrame = window.requestAnimationFrame(updateSurfaceMasks)
}

onMounted(() => {
  scheduleSurfaceMasks()
  window.addEventListener('scroll', scheduleSurfaceMasks, { passive: true })
  window.addEventListener('resize', scheduleSurfaceMasks)

  landingAssistEvents.forEach((eventName) => {
    window.addEventListener(eventName, cancelLandingAssist, { passive: true })
  })
  landingAssistTimer = window.setTimeout(runLandingAssist, 650)
})

onBeforeUnmount(() => {
  if (landingAssistTimer !== undefined) window.clearTimeout(landingAssistTimer)
  if (landingAssistFrame !== undefined) window.cancelAnimationFrame(landingAssistFrame)
  removeLandingAssistListeners()
  clearLandingTitleLead()
  window.removeEventListener('scroll', scheduleSurfaceMasks)
  window.removeEventListener('resize', scheduleSurfaceMasks)
  if (maskFrame !== undefined) window.cancelAnimationFrame(maskFrame)
})
</script>

<style scoped>
.baeren-home-scroll {
  position: relative;
  display: grid;
  width: 100vw;
  margin-block-start: calc(0px - var(--ui-header-height));
  margin-inline-start: calc(50% - 50vw);
}

.baeren-home-scroll__photo {
  grid-area: 1 / 1;
  position: sticky;
  top: 0;
  align-self: start;
  height: 100svh;
  background-image: url('/img/app/background.png');
  background-position: center;
  background-size: cover;
}

.baeren-home-scroll__stages {
  grid-area: 1 / 1;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10svh;
  padding-block: 100svh 32svh;
  padding-inline: max(1rem, calc((100vw - 80rem) / 2));
}
</style>
