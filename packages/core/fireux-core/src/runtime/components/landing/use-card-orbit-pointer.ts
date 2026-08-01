import { ref, type Ref } from 'vue'
import { ORBIT_TAU } from './card-orbit-geometry'

export type OrbitSelectionSource = 'click' | 'hover' | null

type OrbitPointerOptions = {
  root: Ref<HTMLElement | null>
  yaw: Ref<number>
  pitch: Ref<number>
  selectedId: Ref<string | null>
  selectionSource: Ref<OrbitSelectionSource>
  isDragging: Ref<boolean>
  stopAnimation: () => void
  startAnimation: () => void
  settleIntro: (settleToMainAxis?: boolean) => void
}

type DragMode = 'pending' | 'orbit' | 'scroll' | null

export function useCardOrbitPointer(options: OrbitPointerOptions) {
  const dragMode = ref<DragMode>(null)
  const dragMoved = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const startYaw = ref(0)
  const startPitch = ref(0)

  const rememberPointer = (event: PointerEvent) => {
    startX.value = event.clientX
    startY.value = event.clientY
    startYaw.value = options.yaw.value
    startPitch.value = options.pitch.value
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return
    options.stopAnimation()
    options.settleIntro(false)
    options.selectedId.value = null
    options.selectionSource.value = null
    options.isDragging.value = true
    dragMode.value = event.pointerType === 'touch' ? 'pending' : 'orbit'
    dragMoved.value = false
    rememberPointer(event)
    if (event.pointerType !== 'touch') {
      options.root.value?.setPointerCapture(event.pointerId)
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    const root = options.root.value
    if (!options.isDragging.value || !root) return
    const dx = event.clientX - startX.value
    const dy = event.clientY - startY.value

    if (dragMode.value === 'pending') {
      if (Math.hypot(dx, dy) < 10) return
      dragMode.value = Math.abs(dx) > Math.abs(dy) ? 'orbit' : 'scroll'
      dragMoved.value = true
      if (dragMode.value === 'orbit') root.setPointerCapture(event.pointerId)
    }

    if (dragMode.value === 'scroll') {
      options.isDragging.value = false
      options.startAnimation()
      return
    }
    if (dragMode.value !== 'orbit') return

    const bounds = root.getBoundingClientRect()
    if (Math.hypot(dx, dy) >= 4) dragMoved.value = true
    options.yaw.value = startYaw.value + (dx / bounds.width) * ORBIT_TAU
    if (event.pointerType !== 'touch') {
      options.pitch.value = Math.max(
        -0.55,
        Math.min(0.55, startPitch.value - (dy / bounds.height) * 0.8)
      )
    }
  }

  const onPointerUp = (event: PointerEvent) => {
    const root = options.root.value
    if (root?.hasPointerCapture(event.pointerId)) {
      root.releasePointerCapture(event.pointerId)
    }
    options.isDragging.value = false
    dragMode.value = null
    options.startAnimation()
    if (dragMoved.value) {
      window.setTimeout(() => {
        dragMoved.value = false
      }, 0)
    }
  }

  return { dragMoved, onPointerDown, onPointerMove, onPointerUp }
}
