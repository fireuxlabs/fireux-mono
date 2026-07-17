<template>
  <nav
    ref="navElement"
    class="menu-section-nav"
    aria-label="Menu sections"
  >
    <details ref="detailsElement">
      <summary aria-label="Choose menu section">
        <span class="menu-section-nav__icon" aria-hidden="true">
          <UIcon name="i-lucide-list-tree" />
        </span>

        <span class="menu-section-nav__current">
          <small>Sections</small>
          <strong>{{ activeSectionLabel }}</strong>
        </span>

        <span class="menu-section-nav__count" aria-hidden="true">
          {{ activeSectionNumber }} / {{ sections.length }}
        </span>

        <UIcon
          class="menu-section-nav__chevron"
          name="i-lucide-chevron-down"
          aria-hidden="true"
        />
      </summary>

      <div class="menu-section-nav__panel">
        <button
          v-for="(section, index) in sections"
          :key="section.anchor"
          type="button"
          class="menu-section-nav__option"
          :class="{
            'menu-section-nav__option--active': activeAnchor === section.anchor,
          }"
          :aria-current="activeAnchor === section.anchor ? 'location' : undefined"
          @click="activateSection(section.anchor)"
        >
          <span class="menu-section-nav__number" aria-hidden="true">
            {{ sectionNumber(index) }}
          </span>
          <span>{{ section.label }}</span>
          <UIcon
            v-if="activeAnchor === section.anchor"
            name="i-lucide-check"
            aria-hidden="true"
          />
        </button>
      </div>
    </details>
  </nav>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

type MenuSectionLink = {
  anchor: string
  headingId: string
  label: string
}

const props = defineProps<{
  sections: MenuSectionLink[]
}>()

const activeAnchor = ref(props.sections[0]?.anchor || '')
const navElement = ref<HTMLElement | null>(null)
const detailsElement = ref<HTMLDetailsElement | null>(null)
let scrollFrame = 0
let trackingSuspendedUntil = 0
const activeSectionNumber = computed(() => {
  const index = props.sections.findIndex(({ anchor }) => anchor === activeAnchor.value)

  return index >= 0 ? index + 1 : 1
})
const activeSectionLabel = computed(() =>
  props.sections.find(({ anchor }) => anchor === activeAnchor.value)?.label ||
  props.sections[0]?.label ||
  'Menu'
)

function sectionNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

function hasAnchor(anchor: string) {
  return props.sections.some((section) => section.anchor === anchor)
}

function setActive(anchor: string) {
  if (!hasAnchor(anchor) || activeAnchor.value === anchor) return

  activeAnchor.value = anchor
}

function currentHashAnchor() {
  const hash = window.location.hash.slice(1)

  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

function activateSection(anchor: string) {
  const section = props.sections.find(candidate => candidate.anchor === anchor)
  if (!section) return

  if (detailsElement.value) detailsElement.value.open = false
  trackingSuspendedUntil = performance.now() + 1200
  setActive(anchor)
  window.history.replaceState(null, '', `#${encodeURIComponent(anchor)}`)
  document.getElementById(anchor)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
    block: 'start',
  })
  window.setTimeout(() => {
    setActive(anchor)
    document.getElementById(section.headingId)?.focus({ preventScroll: true })
  }, 350)
}

function syncHash() {
  const anchor = currentHashAnchor()
  if (anchor) setActive(anchor)
}

function trackActiveSection() {
  scrollFrame = 0
  if (performance.now() < trackingSuspendedUntil) return

  const sections = props.sections.flatMap((section) => {
    const element = document.getElementById(section.anchor)
    return element ? [element] : []
  })
  if (!sections.length) return

  const sectionList = sections[0]?.parentElement
  const columnCount = sectionList
    ? Number.parseInt(window.getComputedStyle(sectionList).columnCount, 10)
    : 1
  if (Number.isFinite(columnCount) && columnCount > 1) return

  const documentHeight = document.documentElement.scrollHeight
  const atDocumentEnd = Math.ceil(window.scrollY + window.innerHeight) >=
    documentHeight - 2
  if (atDocumentEnd) {
    setActive(sections.at(-1)?.id || '')
    return
  }

  const activationLine = (navElement.value?.getBoundingClientRect().bottom || 0) + 20
  const positions = sections.map(element => ({
    element,
    rect: element.getBoundingClientRect(),
  }))
  const crossing = positions
    .filter(({ rect }) => rect.top <= activationLine && rect.bottom > activationLine)
    .sort((a, b) => a.rect.left - b.rect.left)
  const ahead = positions
    .filter(({ rect }) => rect.top > activationLine)
    .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left)
  const behind = positions
    .filter(({ rect }) => rect.bottom <= activationLine)
    .sort((a, b) => b.rect.bottom - a.rect.bottom || a.rect.left - b.rect.left)
  const current = crossing[0] || ahead[0] || behind[0]

  if (current) setActive(current.element.id)
}

function requestTracking() {
  if (scrollFrame) return
  scrollFrame = window.requestAnimationFrame(trackActiveSection)
}

function handleResize() {
  requestTracking()
}

function handlePointerDown(event: PointerEvent) {
  const nav = navElement.value
  if (
    !detailsElement.value?.open ||
    !(event.target instanceof Node) ||
    nav?.contains(event.target)
  ) return

  detailsElement.value.open = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !detailsElement.value?.open) return

  detailsElement.value.open = false
  detailsElement.value.querySelector<HTMLElement>('summary')?.focus()
}

function resetNavigation() {
  if (!import.meta.client) return

  const hashAnchor = currentHashAnchor()
  const hasHashAnchor = hasAnchor(hashAnchor)
  const anchor = hasHashAnchor
    ? hashAnchor
    : props.sections[0]?.anchor || ''
  activeAnchor.value = anchor
  if (!hasHashAnchor) requestTracking()
}

onMounted(() => {
  resetNavigation()
  window.addEventListener('scroll', requestTracking, { passive: true })
  window.addEventListener('resize', handleResize)
  window.addEventListener('hashchange', syncHash)
  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
  window.removeEventListener('scroll', requestTracking)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('hashchange', syncHash)
  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleKeydown)
})

watch(
  () => props.sections.map((section) => section.anchor).join('|'),
  resetNavigation
)
</script>

<style scoped>
.menu-section-nav {
  position: sticky;
  z-index: 5;
  top: var(--menu-section-nav-top);
  width: min(100%, 34rem);
  min-width: 0;
  align-self: start;
  margin-inline: auto;
}

.menu-section-nav details {
  position: relative;
}

.menu-section-nav summary {
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr) auto 1.2rem;
  gap: 0.75rem;
  width: 100%;
  min-height: 3.5rem;
  min-width: 0;
  align-items: center;
  padding: 0.45rem 0.7rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 15%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-bg) 94%, transparent);
  box-shadow: 0 0.7rem 2rem color-mix(in srgb, var(--menu-bg-dark) 12%, transparent);
  color: var(--menu-text);
  cursor: pointer;
  list-style: none;
  backdrop-filter: blur(18px);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.menu-section-nav summary::-webkit-details-marker {
  display: none;
}

.menu-section-nav details[open] summary {
  border-color: color-mix(in srgb, var(--menu-secondary) 52%, transparent);
  box-shadow: 0 0.8rem 2.25rem color-mix(in srgb, var(--menu-bg-dark) 18%, transparent);
}

.menu-section-nav__icon {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-secondary) 12%, var(--menu-bg));
  color: var(--menu-secondary);
}

.menu-section-nav__current {
  display: grid;
  gap: 0.05rem;
  min-width: 0;
  text-align: left;
}

.menu-section-nav__current small {
  color: var(--menu-muted);
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.menu-section-nav__current strong {
  overflow: hidden;
  color: var(--menu-text);
  font-size: 0.88rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-section-nav__count {
  padding: 0.25rem 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-secondary) 9%, var(--menu-bg));
  color: var(--menu-secondary);
  font-size: 0.67rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.menu-section-nav__chevron {
  color: var(--menu-secondary);
  transition: transform 150ms ease;
}

.menu-section-nav details[open] .menu-section-nav__chevron {
  transform: rotate(180deg);
}

.menu-section-nav summary:focus-visible {
  outline: 2px solid var(--menu-secondary);
  outline-offset: 2px;
}

.menu-section-nav__panel {
  position: absolute;
  z-index: 2;
  top: calc(100% + 0.5rem);
  right: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
  max-height: min(60vh, 28rem);
  padding: 0.55rem;
  overflow-y: auto;
  border: 1px solid color-mix(in srgb, var(--menu-text) 15%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-bg) 98%, transparent);
  box-shadow: 0 1.15rem 3rem color-mix(in srgb, var(--menu-bg-dark) 22%, transparent);
  backdrop-filter: blur(20px);
}

.menu-section-nav__option {
  display: grid;
  grid-template-columns: 1.7rem minmax(0, 1fr) 1rem;
  gap: 0.55rem;
  min-height: 2.75rem;
  align-items: center;
  padding: 0.55rem 0.65rem;
  border: 1px solid transparent;
  border-radius: var(--menu-radius-control);
  background: transparent;
  color: var(--menu-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  text-align: left;
}

.menu-section-nav__option:hover {
  background: color-mix(in srgb, var(--menu-secondary) 7%, var(--menu-bg));
  color: var(--menu-text);
}

.menu-section-nav__option--active {
  border-color: color-mix(in srgb, var(--menu-secondary) 38%, transparent);
  background: color-mix(in srgb, var(--menu-secondary) 11%, var(--menu-bg));
  color: var(--menu-text);
}

.menu-section-nav__option:focus-visible {
  outline: 2px solid var(--menu-secondary);
  outline-offset: -1px;
}

.menu-section-nav__number {
  color: var(--menu-secondary);
  font-size: 0.65rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.menu-section-nav__option > .iconify {
  color: var(--menu-secondary);
}

@media (max-width: 48rem) {
  .menu-section-nav {
    width: min(
      calc(100% - var(--menu-browse-nav-inline-end, 0rem)),
      34rem
    );
    margin-inline-start: auto;
    margin-inline-end: var(--menu-browse-nav-inline-end, 0rem);
  }
}

@media (max-width: 35rem) {
  .menu-section-nav__panel {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
