<template>
  <div
    ref="root"
    class="landing-card-orbit"
    :class="{ 'landing-card-orbit--active': isActive }"
    :aria-label="ariaLabel"
    :data-orbit-source="dataSource"
    tabindex="0"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @click.self="clearSelection"
    @keydown.left.prevent="rotateBy(-1)"
    @keydown.right.prevent="rotateBy(1)"
    @keydown.esc="clearSelection"
  >
    <div class="landing-card-orbit__sphere" aria-hidden="true">
      <span class="landing-card-orbit__ring landing-card-orbit__ring--one" />
      <span class="landing-card-orbit__ring landing-card-orbit__ring--two" />
      <span class="landing-card-orbit__ring landing-card-orbit__ring--three" />
      <span
        v-for="dot in 8"
        :key="dot"
        class="landing-card-orbit__dot"
        :style="{ '--landing-orbit-dot-index': dot }"
      />
    </div>

    <div
      v-for="(item, index) in resolvedItems"
      :key="item.id"
      class="landing-card-orbit__item"
      :class="{ 'landing-card-orbit__item--selected': selectedId === item.id }"
      :style="itemStyle(item)"
      :aria-hidden="isItemBehind(item)"
      @pointerenter="selectOnHover(item, $event)"
      @click.stop="select(item, 'click')"
    >
      <span class="landing-card-orbit__reference">{{ item.label }}</span>
      <div class="landing-card-orbit__content" inert>
        <slot name="item" :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type {
  LandingCardOrbitDataSource,
  LandingCardOrbitItem,
} from '../../../types/landing-card-orbit'
import {
  landingOrbitItemCoordinates,
  landingOrbitItemStyle,
  ORBIT_DEFAULT_PITCH,
  ORBIT_DEFAULT_YAW,
  ORBIT_IDLE_SPEED,
  ORBIT_INTRO_DURATION,
  ORBIT_INTRO_PITCH_SWEEP_MAX,
  ORBIT_INTRO_PITCH_SWEEP_MIN,
  ORBIT_INTRO_START_SPEED,
  ORBIT_TAU,
  resolveLandingOrbitItems,
  type ResolvedOrbitItem,
} from './card-orbit-geometry'
import {
  useCardOrbitPointer,
  type OrbitSelectionSource,
} from './use-card-orbit-pointer'

type IntroState = 'pending' | 'running' | 'complete'

const props = withDefaults(
  defineProps<{
    items: readonly LandingCardOrbitItem[]
    dataSource: LandingCardOrbitDataSource
    ariaLabel?: string
    autoplay?: boolean
    mobileAutoplay?: boolean
  }>(),
  {
    ariaLabel: 'Interactive card orbit',
    autoplay: true,
    mobileAutoplay: true,
  }
)

const MOBILE_QUERY = '(width < 48rem)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const root = ref<HTMLElement | null>(null)
const rootWidth = ref(1200)
const yaw = ref(ORBIT_DEFAULT_YAW)
const pitch = ref(ORBIT_DEFAULT_PITCH)
const selectedId = ref<string | null>(null)
const selectionSource = ref<OrbitSelectionSource>(null)
const isDragging = ref(false)
const isPointerInside = ref(false)
const isVisible = ref(false)
const isReducedMotion = ref(false)
const isMobile = ref(false)
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let animationFrame: number | undefined
let lastFrameTime = 0
let introState: IntroState = 'pending'
let introAllowed = false
let mediaReady = false
let introElapsed = 0
let introStartYaw = ORBIT_DEFAULT_YAW
let orbitDirection: -1 | 1 = 1
let introPitchSweep = ORBIT_INTRO_PITCH_SWEEP_MIN
let reducedMotionMedia: MediaQueryList | undefined
let mobileMedia: MediaQueryList | undefined

const resolvedItems = computed(() => resolveLandingOrbitItems(props.items))

const isActive = computed(() => isDragging.value || selectedId.value !== null)

const shouldAnimate = () =>
  props.autoplay &&
  (!isMobile.value || props.mobileAutoplay) &&
  !isReducedMotion.value &&
  !isPointerInside.value &&
  !isDragging.value &&
  selectedId.value === null &&
  (isMobile.value || isVisible.value) &&
  document.visibilityState === 'visible'

const shouldRunIntro = () =>
  introState === 'running' &&
  !isMobile.value &&
  !isReducedMotion.value &&
  !isPointerInside.value &&
  !isDragging.value &&
  selectedId.value === null &&
  isVisible.value &&
  document.visibilityState === 'visible'

const shouldRunFrame = () => shouldRunIntro() || shouldAnimate()

const stopAnimation = () => {
  if (animationFrame !== undefined) {
    cancelAnimationFrame(animationFrame)
    animationFrame = undefined
  }
}

const settleIntro = (settleToMainAxis = true) => {
  if (introState === 'complete') return

  introState = 'complete'
  introElapsed = 0
  if (settleToMainAxis) pitch.value = ORBIT_DEFAULT_PITCH
}

const startIntro = () => {
  if (
    introState !== 'pending' ||
    !introAllowed ||
    !props.autoplay ||
    isMobile.value ||
    isReducedMotion.value ||
    isPointerInside.value ||
    isDragging.value ||
    selectedId.value !== null ||
    !isVisible.value ||
    document.visibilityState !== 'visible'
  ) {
    return
  }

  introState = 'running'
  introElapsed = 0
  introStartYaw = yaw.value
  pitch.value = ORBIT_DEFAULT_PITCH
}

const animate = (now: number) => {
  if (!shouldRunFrame()) {
    stopAnimation()
    return
  }

  const elapsed = Math.min(48, Math.max(0, now - lastFrameTime))
  lastFrameTime = now

  if (introState === 'running') {
    introElapsed = Math.min(ORBIT_INTRO_DURATION, introElapsed + elapsed)
    const progress = introElapsed / ORBIT_INTRO_DURATION
    const decelerationTravel =
      progress -
      2.5 * progress ** 4 +
      3 * progress ** 5 -
      progress ** 6
    const introTravel =
      ORBIT_INTRO_DURATION *
      (ORBIT_IDLE_SPEED * progress +
        (ORBIT_INTRO_START_SPEED - ORBIT_IDLE_SPEED) * decelerationTravel)

    yaw.value =
      (introStartYaw + introTravel * orbitDirection + ORBIT_TAU) % ORBIT_TAU
    pitch.value =
      ORBIT_DEFAULT_PITCH +
      Math.sin(introTravel) * introPitchSweep

    if (progress >= 1) settleIntro()
  } else {
    yaw.value =
      (yaw.value + elapsed * ORBIT_IDLE_SPEED * orbitDirection + ORBIT_TAU) % ORBIT_TAU
  }

  animationFrame = requestAnimationFrame(animate)
}

const startAnimation = () => {
  startIntro()
  if (!shouldRunFrame() || animationFrame !== undefined) return
  lastFrameTime = performance.now()
  animationFrame = requestAnimationFrame(animate)
}

const isItemBehind = (item: ResolvedOrbitItem) =>
  landingOrbitItemCoordinates({
    item,
    yaw: yaw.value,
    pitch: pitch.value,
  }).depth < 0.3

const itemStyle = (item: ResolvedOrbitItem) =>
  landingOrbitItemStyle({
    item,
    yaw: yaw.value,
    pitch: pitch.value,
    rootWidth: rootWidth.value,
    selectedId: selectedId.value,
  })

const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return
  isPointerInside.value = true
  stopAnimation()
}

const onPointerLeave = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return
  isPointerInside.value = false
  if (selectionSource.value === 'hover') clearSelection()
  else if (!isDragging.value) startAnimation()
}

const { dragMoved, onPointerDown, onPointerMove, onPointerUp } =
  useCardOrbitPointer({
    root,
    yaw,
    pitch,
    selectedId,
    selectionSource,
    isDragging,
    stopAnimation,
    startAnimation,
    settleIntro,
  })

const select = (
  item: ResolvedOrbitItem,
  source: Exclude<OrbitSelectionSource, null>
) => {
  if (dragMoved.value) return

  stopAnimation()
  selectedId.value = item.id
  selectionSource.value = source
}

const selectOnHover = (
  item: ResolvedOrbitItem,
  event: PointerEvent
) => {
  if (
    event.pointerType !== 'mouse' ||
    isDragging.value ||
    selectedId.value === item.id
  ) {
    return
  }

  select(item, 'hover')
}

const clearSelection = () => {
  selectedId.value = null
  selectionSource.value = null
  startAnimation()
}

const rotateBy = (direction: -1 | 1) => {
  stopAnimation()
  settleIntro(false)
  selectedId.value = null
  selectionSource.value = null
  const step = ORBIT_TAU / Math.max(1, resolvedItems.value.length)
  yaw.value += step * direction
  startAnimation()
}

const syncMedia = () => {
  isReducedMotion.value = reducedMotionMedia?.matches ?? false
  isMobile.value = mobileMedia?.matches ?? false

  if (!mediaReady) {
    mediaReady = true
    introAllowed =
      props.autoplay && !isMobile.value && !isReducedMotion.value

    if (introAllowed) {
      orbitDirection = Math.random() < 0.5 ? -1 : 1
      introPitchSweep =
        (Math.random() < 0.5 ? -1 : 1) *
        (ORBIT_INTRO_PITCH_SWEEP_MIN +
          Math.random() *
            (ORBIT_INTRO_PITCH_SWEEP_MAX - ORBIT_INTRO_PITCH_SWEEP_MIN))
    } else {
      settleIntro()
    }
  } else if (
    introState !== 'complete' &&
    (isMobile.value || isReducedMotion.value)
  ) {
    settleIntro()
  }

  if (shouldRunFrame() || introState === 'pending') startAnimation()
  else stopAnimation()
}

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') startAnimation()
  else stopAnimation()
}

onMounted(() => {
  const updateWidth = () => {
    rootWidth.value = root.value?.getBoundingClientRect().width ?? 1200
  }

  updateWidth()
  resizeObserver = new ResizeObserver(updateWidth)
  if (root.value) resizeObserver.observe(root.value)

  reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY)
  mobileMedia = window.matchMedia(MOBILE_QUERY)
  reducedMotionMedia.addEventListener('change', syncMedia)
  mobileMedia.addEventListener('change', syncMedia)
  syncMedia()

  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = Boolean(entry?.isIntersecting)
      if (isVisible.value) startAnimation()
      else if (!isMobile.value) stopAnimation()
    },
    { threshold: 0.08 }
  )

  if (root.value) intersectionObserver.observe(root.value)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  stopAnimation()
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  reducedMotionMedia?.removeEventListener('change', syncMedia)
  mobileMedia?.removeEventListener('change', syncMedia)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped src="./CardOrbit.css"></style>
