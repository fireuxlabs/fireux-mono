<template>
  <nav ref="navElement" class="menu-section-nav" :aria-label="navigationLabel">
    <details ref="detailsElement">
      <summary :aria-label="chooseLabel">
        <span class="menu-section-nav__icon" aria-hidden="true">
          <UIcon name="i-lucide-list-tree" />
        </span>

        <span class="menu-section-nav__current">
          <small>{{ sectionsLabel }}</small>
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
          :aria-current="
            activeAnchor === section.anchor ? 'location' : undefined
          "
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type MenuSectionLink = {
  anchor: string
  headingId: string
  label: string
}

const props = defineProps<{
  navigationLabel: string
  chooseLabel: string
  sectionsLabel: string
  sections: MenuSectionLink[]
}>()

const activeAnchor = ref(props.sections[0]?.anchor || '')
const navElement = ref<HTMLElement | null>(null)
const detailsElement = ref<HTMLDetailsElement | null>(null)
let scrollFrame = 0
let trackingSuspendedUntil = 0
const activeSectionNumber = computed(() => {
  const index = props.sections.findIndex(
    ({ anchor }) => anchor === activeAnchor.value
  )

  return index >= 0 ? index + 1 : 1
})
const activeSectionLabel = computed(
  () =>
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
  const section = props.sections.find(
    (candidate) => candidate.anchor === anchor
  )
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
  const atDocumentEnd =
    Math.ceil(window.scrollY + window.innerHeight) >= documentHeight - 2
  if (atDocumentEnd) {
    setActive(sections.at(-1)?.id || '')
    return
  }

  const activationLine =
    (navElement.value?.getBoundingClientRect().bottom || 0) + 20
  const positions = sections.map((element) => ({
    element,
    rect: element.getBoundingClientRect(),
  }))
  const crossing = positions
    .filter(
      ({ rect }) => rect.top <= activationLine && rect.bottom > activationLine
    )
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
  )
    return

  detailsElement.value.open = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !detailsElement.value?.open) return

  detailsElement.value.open = false
  const summary = detailsElement.value.querySelector(
    'summary'
  ) as HTMLElement | null
  summary?.focus()
}

function resetNavigation() {
  if (!import.meta.client) return

  const hashAnchor = currentHashAnchor()
  const hasHashAnchor = hasAnchor(hashAnchor)
  const anchor = hasHashAnchor ? hashAnchor : props.sections[0]?.anchor || ''
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

<style scoped src="../../assets/styles/menu-section-nav.css"></style>
