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
      @click.stop="select(item)"
    >
      <span class="landing-card-orbit__reference">{{ item.label }}</span>
      <div class="landing-card-orbit__content" inert>
        <slot name="item" :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  type CSSProperties,
} from 'vue'
import type {
  LandingCardOrbitDataSource,
  LandingCardOrbitItem,
} from '../../../types/landing-card-orbit'

type ResolvedOrbitItem = Required<LandingCardOrbitItem>
type DragMode = 'pending' | 'orbit' | 'scroll' | null

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
    mobileAutoplay: false,
  }
)

const TAU = Math.PI * 2
const IDLE_SPEED = TAU / 24000
const MOBILE_QUERY = '(width < 48rem)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const DEFAULT_LATITUDES = [
  -0.68, -0.2, 0.34, 0.7, 0.08, -0.44, 0.54, -0.58, 0.24, -0.04,
] as const

const root = ref<HTMLElement | null>(null)
const rootWidth = ref(1200)
const yaw = ref(0.72)
const pitch = ref(-0.12)
const selectedId = ref<string | null>(null)
const isDragging = ref(false)
const isPointerInside = ref(false)
const isVisible = ref(false)
const isReducedMotion = ref(false)
const isMobile = ref(false)
const dragMode = ref<DragMode>(null)
const dragMoved = ref(false)

const startX = ref(0)
const startY = ref(0)
const startYaw = ref(0)
const startPitch = ref(0)

let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let animationFrame: number | undefined
let lastFrameTime = 0
let reducedMotionMedia: MediaQueryList | undefined
let mobileMedia: MediaQueryList | undefined

const resolvedItems = computed<ResolvedOrbitItem[]>(() => {
  const count = Math.max(1, props.items.length)

  return props.items.map((item, index) => ({
    ...item,
    latitude:
      typeof item.latitude === 'number'
        ? item.latitude
        : (DEFAULT_LATITUDES[index % DEFAULT_LATITUDES.length] ?? 0),
    longitude:
      typeof item.longitude === 'number'
        ? item.longitude
        : (index / count) * TAU - Math.PI / 2,
  }))
})

const isActive = computed(() => isDragging.value || selectedId.value !== null)

const shouldAnimate = () =>
  props.autoplay &&
  (!isMobile.value || props.mobileAutoplay) &&
  !isReducedMotion.value &&
  !isPointerInside.value &&
  !isDragging.value &&
  selectedId.value === null &&
  isVisible.value &&
  document.visibilityState === 'visible'

const stopAnimation = () => {
  if (animationFrame !== undefined) {
    cancelAnimationFrame(animationFrame)
    animationFrame = undefined
  }
}

const animate = (now: number) => {
  if (!shouldAnimate()) {
    stopAnimation()
    return
  }

  const elapsed = Math.min(48, Math.max(0, now - lastFrameTime))
  lastFrameTime = now
  yaw.value = (yaw.value + elapsed * IDLE_SPEED + TAU) % TAU
  animationFrame = requestAnimationFrame(animate)
}

const startAnimation = () => {
  if (!shouldAnimate() || animationFrame !== undefined) return
  lastFrameTime = performance.now()
  animationFrame = requestAnimationFrame(animate)
}

const itemCoordinates = (item: ResolvedOrbitItem) => {
  const cosLatitude = Math.cos(item.latitude)
  const baseX = cosLatitude * Math.sin(item.longitude)
  const baseY = Math.sin(item.latitude)
  const baseZ = cosLatitude * Math.cos(item.longitude)

  const rotatedX = baseX * Math.cos(yaw.value) + baseZ * Math.sin(yaw.value)
  const yawDepth = -baseX * Math.sin(yaw.value) + baseZ * Math.cos(yaw.value)
  const rotatedY =
    baseY * Math.cos(pitch.value) - yawDepth * Math.sin(pitch.value)
  const rotatedDepth =
    baseY * Math.sin(pitch.value) + yawDepth * Math.cos(pitch.value)
  const depth = Math.max(0, Math.min(1, (rotatedDepth + 1) / 2))

  return { depth, rotatedX, rotatedY }
}

const isItemBehind = (item: ResolvedOrbitItem) =>
  itemCoordinates(item).depth < 0.3

const stableStyleNumber = (value: number) => Number(value.toFixed(6))

const itemStyle = (item: ResolvedOrbitItem): CSSProperties => {
  const { depth, rotatedX, rotatedY } = itemCoordinates(item)
  const compact = rootWidth.value < 768
  const radiusX = compact
    ? Math.max(132, Math.min(168, rootWidth.value * 0.4))
    : 304
  const radiusY = compact ? 142 : 178
  const scale =
    (compact ? 0.46 : 0.58) +
    depth * (compact ? 0.22 : 0.28) +
    (selectedId.value === item.id ? 0.03 : 0)

  return {
    zIndex: selectedId.value === item.id ? 1000 : Math.round(depth * 800),
    opacity: stableStyleNumber(0.38 + depth * 0.62),
    pointerEvents:
      depth < 0.3 && selectedId.value !== item.id ? 'none' : 'auto',
    transform: `translate(calc(-50% + ${stableStyleNumber(rotatedX * radiusX)}px), calc(-50% + ${stableStyleNumber(rotatedY * radiusY)}px)) scale(${stableStyleNumber(scale)})`,
  }
}

const rememberPointer = (event: PointerEvent) => {
  startX.value = event.clientX
  startY.value = event.clientY
  startYaw.value = yaw.value
  startPitch.value = pitch.value
}

const onPointerEnter = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return
  isPointerInside.value = true
  stopAnimation()
}

const onPointerLeave = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return
  isPointerInside.value = false
  if (!isDragging.value) startAnimation()
}

const onPointerDown = (event: PointerEvent) => {
  if (event.button !== 0) return

  stopAnimation()
  selectedId.value = null
  isDragging.value = true
  dragMode.value = event.pointerType === 'touch' ? 'pending' : 'orbit'
  dragMoved.value = false
  rememberPointer(event)

  if (event.pointerType !== 'touch') {
    root.value?.setPointerCapture(event.pointerId)
  }
}

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value || !root.value) return

  const dx = event.clientX - startX.value
  const dy = event.clientY - startY.value

  if (dragMode.value === 'pending') {
    if (Math.hypot(dx, dy) < 10) return

    dragMode.value = Math.abs(dx) > Math.abs(dy) ? 'orbit' : 'scroll'
    dragMoved.value = true

    if (dragMode.value === 'orbit') {
      root.value.setPointerCapture(event.pointerId)
    }
  }

  if (dragMode.value === 'scroll') {
    isDragging.value = false
    startAnimation()
    return
  }

  if (dragMode.value !== 'orbit') return

  const bounds = root.value.getBoundingClientRect()
  if (Math.hypot(dx, dy) >= 4) dragMoved.value = true

  yaw.value = startYaw.value + (dx / bounds.width) * TAU
  if (event.pointerType !== 'touch') {
    pitch.value = Math.max(
      -0.55,
      Math.min(0.55, startPitch.value - (dy / bounds.height) * 0.8)
    )
  }
}

const onPointerUp = (event: PointerEvent) => {
  if (root.value?.hasPointerCapture(event.pointerId)) {
    root.value.releasePointerCapture(event.pointerId)
  }

  isDragging.value = false
  dragMode.value = null
  startAnimation()

  if (dragMoved.value) {
    window.setTimeout(() => {
      dragMoved.value = false
    }, 0)
  }
}

const select = (item: ResolvedOrbitItem) => {
  if (dragMoved.value) return

  stopAnimation()
  selectedId.value = item.id
  yaw.value = -item.longitude
  pitch.value = item.latitude
}

const clearSelection = () => {
  selectedId.value = null
  startAnimation()
}

const rotateBy = (direction: -1 | 1) => {
  stopAnimation()
  selectedId.value = null
  const step = TAU / Math.max(1, resolvedItems.value.length)
  yaw.value += step * direction
  startAnimation()
}

const syncMedia = () => {
  isReducedMotion.value = reducedMotionMedia?.matches ?? false
  isMobile.value = mobileMedia?.matches ?? false

  if (shouldAnimate()) startAnimation()
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
      else stopAnimation()
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

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-card-orbit {
  position: relative;
  min-width: 0;
  min-height: 42rem;
  overflow: clip;
  isolation: isolate;
  border-radius: calc(var(--ui-radius) * 4);
  outline: none;
  cursor: grab;
  touch-action: pan-y;
}

.landing-card-orbit:active {
  cursor: grabbing;
}

.landing-card-orbit:focus-visible {
  outline: 2px solid
    color-mix(
      in srgb,
      var(--landing-card-orbit-accent, var(--ui-primary)) 68%,
      transparent
    );
  outline-offset: var(--spacing);
}

.landing-card-orbit__sphere {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(128vw, 32rem);
  aspect-ratio: 1;
  border: 1px solid
    color-mix(
      in srgb,
      var(--landing-card-orbit-accent, var(--ui-primary)) 16%,
      transparent
    );
  border-radius: 50%;
  opacity: 0.62;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: opacity 180ms ease;
}

.landing-card-orbit--active .landing-card-orbit__sphere {
  opacity: 0.9;
}

.landing-card-orbit__ring {
  position: absolute;
  inset: 10%;
  border: 1px solid
    color-mix(
      in srgb,
      var(--landing-card-orbit-accent, var(--ui-primary)) 17%,
      transparent
    );
  border-radius: 50%;
}

.landing-card-orbit__ring--one {
  transform: scaleY(0.34) rotate(8deg);
}

.landing-card-orbit__ring--two {
  transform: scaleX(0.38) rotate(18deg);
}

.landing-card-orbit__ring--three {
  opacity: 0.65;
  transform: scaleY(0.5) rotate(58deg);
}

.landing-card-orbit__dot {
  --landing-orbit-dot-angle: calc(var(--landing-orbit-dot-index) * 45deg);

  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--spacing) * 1.25);
  height: calc(var(--spacing) * 1.25);
  border-radius: 50%;
  background: color-mix(
    in srgb,
    var(--landing-card-orbit-accent, var(--ui-primary)) 68%,
    var(--ui-text-highlighted)
  );
  opacity: 0.58;
  transform: rotate(var(--landing-orbit-dot-angle)) translateX(min(64vw, 16rem))
    rotate(calc(var(--landing-orbit-dot-angle) * -1));
}

.landing-card-orbit__item {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: max-content;
  max-width: calc(100% - var(--spacing) * 4);
  gap: var(--spacing);
  cursor: pointer;
  will-change: transform;
}

.landing-card-orbit__reference {
  width: max-content;
  max-width: 100%;
  padding: var(--spacing) calc(var(--spacing) * 2);
  border: 1px solid
    color-mix(
      in srgb,
      var(--landing-card-orbit-accent, var(--ui-primary)) 32%,
      var(--ui-border)
    );
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-bg) 90%, transparent);
  color: color-mix(
    in srgb,
    var(--ui-text) 80%,
    var(--landing-card-orbit-accent, var(--ui-primary))
  );
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  letter-spacing: var(--tracking-wide);
  pointer-events: none;
}

.landing-card-orbit__content {
  pointer-events: none;
  user-select: none;
}

@media (min-width: 48rem) {
  .landing-card-orbit {
    min-height: 48rem;
  }

  .landing-card-orbit__sphere {
    width: min(72vw, 38rem);
  }

  .landing-card-orbit__dot {
    transform: rotate(var(--landing-orbit-dot-angle))
      translateX(min(36vw, 19rem))
      rotate(calc(var(--landing-orbit-dot-angle) * -1));
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-card-orbit__sphere {
    transition: none;
  }

  .landing-card-orbit__item {
    will-change: auto;
  }
}
</style>
