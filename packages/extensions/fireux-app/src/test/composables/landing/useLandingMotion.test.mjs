import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript'

function fixture({ reduced = false, failed = false, delayed = false } = {}) {
  const hooks = {}
  const frames = new Map()
  const observers = []
  const calls = { loads: 0, kills: 0, mediaReverts: 0, contextReverts: 0 }
  const element = () => {
    const classes = new Set()
    const removedStyles = []
    return {
      dataset: {},
      isConnected: true,
      removedStyles,
      classList: {
        add: (...names) => names.forEach((name) => classes.add(name)),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
        contains: (name) => classes.has(name),
      },
      style: { removeProperty: (name) => removedStyles.push(name) },
    }
  }
  const reveal = element()
  const root = element()
  root.querySelectorAll = (selector) =>
    selector === '[data-landing-reveal]' ? [reveal] : [element()]
  const reference = { value: root }
  class Observer {
    constructor(callback) {
      this.callback = callback
      this.disconnected = false
      observers.push(this)
    }
    observe(target) {
      this.target = target
    }
    disconnect() {
      this.disconnected = true
    }
  }
  const gsap = {
    registerPlugin() {},
    set() {},
    to: () => ({ kill: () => calls.kills++ }),
    context(callback) {
      callback()
      return { revert: () => calls.contextReverts++ }
    },
    matchMedia: () => ({ add() {}, revert: () => calls.mediaReverts++ }),
  }
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  const source = readFileSync(
    new URL(
      '../../../runtime/composables/landing/useLandingMotion.ts',
      import.meta.url
    ),
    'utf8'
  )
  const output = transpileModule(source, {
    compilerOptions: {
      module: ModuleKind.CommonJS,
      target: ScriptTarget.ES2022,
    },
  }).outputText
  const module = { exports: {} }
  const runtime = compileFunction(`${output}\nreturn module.exports`, [
    'module',
    'exports',
    'require',
    'window',
    'IntersectionObserver',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'getComputedStyle',
  ])(
    module,
    module.exports,
    (name) => {
      if (name === 'vue')
        return {
          nextTick: async () => {},
          onMounted: (callback) => {
            hooks.mount = callback
          },
          onBeforeUnmount: (callback) => {
            hooks.unmount = callback
          },
        }
      if (name === './landing-sticky-motion')
        return { animateLandingStickySurfaces() {} }
      if (name === 'gsap/ScrollTrigger') return { ScrollTrigger: {} }
      assert.equal(name, 'gsap')
      calls.loads++
      if (failed) throw new Error('Animation runtime unavailable')
      return delayed ? gate.then(() => ({ gsap })) : { gsap }
    },
    {
      matchMedia: () => ({ matches: reduced }),
      IntersectionObserver: Observer,
    },
    Observer,
    (callback) => {
      const id = frames.size + 1
      frames.set(id, callback)
      return id
    },
    (id) => frames.delete(id),
    () => ({ getPropertyValue: () => '' })
  )
  runtime.useLandingMotion(reference)
  return { hooks, frames, observers, calls, reveal, root, release }
}

test('Reduced motion preserves visible content when the animation runtime cannot load', async () => {
  const f = fixture({ reduced: true, failed: true })
  await f.hooks.mount()
  assert.equal(f.reveal.classList.contains('is-reveal-visible'), true)
  assert.ok(f.reveal.removedStyles.includes('visibility'))
  assert.equal(f.root.classList.contains('is-motion-pending'), false)
  assert.equal(f.root.classList.contains('is-gsap-motion'), false)
  assert.equal(f.observers.length, 0)
  f.hooks.unmount()
})

test('Unmount disconnects observers and prevents a late animation import from activating the old root', async () => {
  const f = fixture({ delayed: true })
  const mounting = f.hooks.mount()
  await new Promise(setImmediate)
  assert.equal(f.calls.loads, 1)
  assert.equal(f.frames.size, 1)
  f.hooks.unmount()
  f.release()
  await mounting
  assert.equal(f.frames.size, 0)
  assert.ok(f.observers.every((observer) => observer.disconnected))
  assert.equal(f.root.classList.contains('is-gsap-motion'), false)
  assert.equal(f.root.classList.contains('is-motion-pending'), false)
})

test('Unmount kills active reveals and reverts media and hero animation contexts', async () => {
  const f = fixture()
  await f.hooks.mount()
  assert.equal(f.root.classList.contains('is-gsap-motion'), true)
  for (const callback of f.frames.values()) callback()
  f.observers[0].callback([{ isIntersecting: true }])
  f.hooks.unmount()
  assert.equal(f.calls.kills, 1)
  assert.equal(f.calls.mediaReverts, 1)
  assert.equal(f.calls.contextReverts, 1)
  assert.equal(f.root.classList.contains('is-gsap-motion'), false)
})
