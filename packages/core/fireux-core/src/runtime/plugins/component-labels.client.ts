import { defineNuxtPlugin } from '#imports'
import type { ComponentPublicInstance } from 'vue'

type LabelledInstance = ComponentPublicInstance & {
  $options: {
    name?: string
    __name?: string
    __file?: string
  }
}

interface TargetLabel {
  element: HTMLElement
  label: HTMLSpanElement
  names: Set<string>
}

const LABEL_ROOT_ID = 'fireux-component-labels'

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.dev) return

  const targets = new Map<HTMLElement, TargetLabel>()
  const instanceTargets = new WeakMap<object, HTMLElement>()
  const root = createLabelRoot()
  const resizeObserver = new ResizeObserver(scheduleRender)
  let renderFrame = 0

  function scheduleRender() {
    if (renderFrame) return
    renderFrame = requestAnimationFrame(renderLabels)
  }

  function renderLabels() {
    renderFrame = 0
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    for (const target of targets.values()) {
      const bounds = target.element.getBoundingClientRect()
      const visible =
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.bottom >= 0 &&
        bounds.right >= 0 &&
        bounds.top <= viewportHeight &&
        bounds.left <= viewportWidth

      target.label.hidden = !visible
      if (!visible) continue

      target.label.textContent = [...target.names].join(' · ')
      target.label.style.transform = `translate(${Math.max(0, bounds.left)}px, ${Math.max(0, bounds.top)}px)`
    }
  }

  function addInstance(instance: LabelledInstance) {
    const name = componentName(instance)
    const element = componentElement(instance)
    if (!name || !element) return

    removeInstance(instance)

    let target = targets.get(element)
    if (!target) {
      const label = document.createElement('span')
      label.className = 'fireux-component-label'
      root.append(label)
      target = { element, label, names: new Set() }
      targets.set(element, target)
      resizeObserver.observe(element)
    }

    target.names.add(name)
    instanceTargets.set(instance, element)
    scheduleRender()
  }

  function removeInstance(instance: LabelledInstance) {
    const element = instanceTargets.get(instance)
    if (!element) return

    const name = componentName(instance)
    const target = targets.get(element)
    if (target && name) target.names.delete(name)

    if (target && target.names.size === 0) {
      resizeObserver.unobserve(element)
      target.label.remove()
      targets.delete(element)
    }

    instanceTargets.delete(instance)
    scheduleRender()
  }

  nuxtApp.vueApp.mixin({
    mounted() {
      addInstance(this as LabelledInstance)
    },
    updated() {
      addInstance(this as LabelledInstance)
    },
    beforeUnmount() {
      removeInstance(this as LabelledInstance)
    },
  })

  window.addEventListener('scroll', scheduleRender, true)
  window.addEventListener('resize', scheduleRender)

  nuxtApp.hook('app:beforeMount', scheduleRender)
  nuxtApp.hook('app:unmounted', () => {
    window.removeEventListener('scroll', scheduleRender, true)
    window.removeEventListener('resize', scheduleRender)
    resizeObserver.disconnect()
    if (renderFrame) cancelAnimationFrame(renderFrame)
    root.remove()
  })
})

function componentName(instance: LabelledInstance): string {
  const file = instance.$options.__file || ''
  if (!file || file.includes('/node_modules/')) return ''
  return instance.$options.name || instance.$options.__name || ''
}

function componentElement(instance: ComponentPublicInstance): HTMLElement | null {
  return instance.$el instanceof HTMLElement ? instance.$el : null
}

function createLabelRoot(): HTMLDivElement {
  document.getElementById(LABEL_ROOT_ID)?.remove()

  const root = document.createElement('div')
  root.id = LABEL_ROOT_ID
  root.setAttribute('aria-hidden', 'true')
  root.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;pointer-events:none;overflow:hidden'

  const style = document.createElement('style')
  style.textContent = `
    .fireux-component-label {
      position: absolute;
      top: 0;
      left: 0;
      max-width: min(42rem, 90vw);
      overflow: hidden;
      padding: calc(var(--spacing) * 0.25) var(--spacing);
      color: hotpink;
      background: rgb(0 0 0 / 82%);
      font: 600 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `
  root.append(style)
  document.body.append(root)
  return root
}
