<template>
  <nav
    ref="navElement"
    class="menu-browse-section-nav"
    aria-label="Menu sections"
  >
    <ul ref="listElement">
      <li v-for="section in sections" :key="section.anchor">
        <a
          :id="linkId(section.anchor)"
          :href="`#${section.anchor}`"
          :aria-controls="section.anchor"
          :aria-current="activeAnchor === section.anchor ? 'location' : undefined"
          @click="activateSection($event, section)"
        >
          {{ section.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

type MenuBrowseSectionLink = {
  anchor: string
  headingId: string
  label: string
}

const props = defineProps<{
  sections: MenuBrowseSectionLink[]
}>()

const activeAnchor = ref(props.sections[0]?.anchor || '')
const navElement = ref<HTMLElement | null>(null)
const listElement = ref<HTMLElement | null>(null)
let scrollFrame = 0

function linkId(anchor: string) {
  return `menu-section-link-${anchor}`
}

function hasAnchor(anchor: string) {
  return props.sections.some((section) => section.anchor === anchor)
}

function revealLink(anchor: string) {
  const list = listElement.value
  const link = document.getElementById(linkId(anchor))
  if (!list || !link) return

  const listRect = list.getBoundingClientRect()
  const linkRect = link.getBoundingClientRect()
  const nextLeft = list.scrollLeft + linkRect.left - listRect.left -
    (listRect.width - linkRect.width) / 2

  list.scrollTo({
    left: Math.max(0, Math.min(nextLeft, list.scrollWidth - list.clientWidth)),
    behavior: 'auto',
  })
}

function setActive(anchor: string, reveal = true) {
  if (!hasAnchor(anchor) || activeAnchor.value === anchor) return

  activeAnchor.value = anchor
  if (reveal) nextTick(() => revealLink(anchor))
}

function currentHashAnchor() {
  const hash = window.location.hash.slice(1)

  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

function activateSection(
  event: MouseEvent,
  section: MenuBrowseSectionLink
) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) return

  setActive(section.anchor)
  window.setTimeout(() => {
    document.getElementById(section.headingId)?.focus({ preventScroll: true })
  })
}

function syncHash() {
  const anchor = currentHashAnchor()
  if (anchor) setActive(anchor)
}

function trackActiveSection() {
  scrollFrame = 0
  const sections = props.sections.flatMap((section) => {
    const element = document.getElementById(section.anchor)
    return element ? [element] : []
  })
  if (!sections.length) return

  const documentHeight = document.documentElement.scrollHeight
  const atDocumentEnd = Math.ceil(window.scrollY + window.innerHeight) >=
    documentHeight - 2
  if (atDocumentEnd) {
    setActive(sections.at(-1)?.id || '')
    return
  }

  const activationLine = (navElement.value?.getBoundingClientRect().bottom || 0) + 20
  let current = sections[0]

  for (const section of sections) {
    if (section.getBoundingClientRect().top > activationLine) break
    current = section
  }
  setActive(current.id)
}

function requestTracking() {
  if (scrollFrame) return
  scrollFrame = window.requestAnimationFrame(trackActiveSection)
}

function handleResize() {
  requestTracking()
  nextTick(() => revealLink(activeAnchor.value))
}

function resetNavigation() {
  if (!import.meta.client) return

  const hashAnchor = currentHashAnchor()
  const hasHashAnchor = hasAnchor(hashAnchor)
  const anchor = hasHashAnchor
    ? hashAnchor
    : props.sections[0]?.anchor || ''
  activeAnchor.value = anchor
  nextTick(() => {
    revealLink(anchor)
    if (!hasHashAnchor) requestTracking()
  })
}

onMounted(() => {
  resetNavigation()
  window.addEventListener('scroll', requestTracking, { passive: true })
  window.addEventListener('resize', handleResize)
  window.addEventListener('hashchange', syncHash)
})

onBeforeUnmount(() => {
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
  window.removeEventListener('scroll', requestTracking)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('hashchange', syncHash)
})

watch(
  () => props.sections.map((section) => section.anchor).join('|'),
  resetNavigation
)
</script>

<style scoped>
.menu-browse-section-nav {
  position: sticky;
  z-index: 5;
  top: var(--menu-browse-nav-top);
  min-width: 0;
  align-self: start;
  margin-inline-end: var(--menu-browse-nav-inline-end, 0rem);
  padding: 0.5rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 15%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-bg) 90%, transparent);
  box-shadow: 0 0.7rem 2rem color-mix(in srgb, var(--menu-bg-dark) 12%, transparent);
  backdrop-filter: blur(18px);
}

.menu-browse-section-nav ul {
  display: flex;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: thin;
}

.menu-browse-section-nav li {
  flex: 0 0 auto;
}

.menu-browse-section-nav a {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: var(--menu-radius-control);
  color: var(--menu-muted);
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.25;
  text-decoration: none;
  white-space: nowrap;
}

.menu-browse-section-nav a:hover {
  color: var(--menu-text);
}

.menu-browse-section-nav a[aria-current="location"] {
  border-color: color-mix(in srgb, var(--menu-secondary) 42%, transparent);
  background: color-mix(in srgb, var(--menu-secondary) 13%, transparent);
  color: var(--menu-text);
}

.menu-browse-section-nav a:focus-visible {
  outline: 2px solid var(--menu-secondary);
  outline-offset: 2px;
}
</style>
