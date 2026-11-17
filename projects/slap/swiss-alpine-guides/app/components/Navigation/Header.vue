<template>
  <UHeader
    v-model:open="open"
    title="Swiss Alpine Guides"
    to="/"
    mode="slideover"
    class="alpine-header"
    :class="{
      'alpine-header--image-route': imageRoute,
      'alpine-header--over-image': overImage,
    }"
  >
    <template #title
      ><span class="alpine-header__brand">Swiss Alpine Guides</span></template
    >
    <UNavigationMenu
      class="alpine-header__navigation"
      color="neutral"
      :items="items"
      aria-label="Main navigation"
    />
    <template #right
      ><UButton
        class="alpine-header__enquire"
        to="/contact"
        color="neutral"
        :variant="overImage ? 'outline' : 'solid'"
        label="Enquire"
    /></template>
    <template #body
      ><UNavigationMenu
        color="neutral"
        :items="items"
        orientation="vertical"
        aria-label="Mobile navigation"
    /></template>
  </UHeader>
</template>
<script setup lang="ts">
const open = ref(false)
const route = useRoute()
const imageRoute = computed(
  () =>
    route.path === '/' ||
    ['/activities', '/summer', '/winter', '/courses'].includes(route.path) ||
    route.path.startsWith('/activities/') ||
    route.path.startsWith('/heliskiing/')
)
const overImage = ref(imageRoute.value)
let frame = 0
function updateContrast() {
  frame = 0
  const hero = document.querySelector<HTMLElement>(
    '.activity-hero, .alpine-scene'
  )
  const header = document.querySelector<HTMLElement>('.alpine-header')
  const collection = document.querySelector<HTMLElement>(
    '.activity-collection--landing'
  )
  const end = Math.min(
    hero?.getBoundingClientRect().bottom ?? 0,
    collection?.getBoundingClientRect().top ?? Infinity
  )
  overImage.value = imageRoute.value && end > (header?.offsetHeight ?? 64)
}
function scheduleContrast() {
  if (!frame) frame = requestAnimationFrame(updateContrast)
}
watch(
  () => route.path,
  () => {
    overImage.value = imageRoute.value
  }
)
const nuxtApp = useNuxtApp()
let removePageHook: (() => void) | undefined
onMounted(() => {
  removePageHook = nuxtApp.hook('page:finish', scheduleContrast)
  window.addEventListener('scroll', scheduleContrast, { passive: true })
  window.addEventListener('resize', scheduleContrast, { passive: true })
  scheduleContrast()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleContrast)
  window.removeEventListener('resize', scheduleContrast)
  if (frame) cancelAnimationFrame(frame)
  removePageHook?.()
})
const items = [
  { label: 'Home', to: '/', exact: true },
  {
    label: 'Activities',
    children: [
      {
        label: 'All activities',
        to: '/activities',
        onSelect: () => {
          open.value = false
        },
      },
      {
        label: 'Summer',
        to: '/summer',
        onSelect: () => {
          open.value = false
        },
      },
      {
        label: 'Winter',
        to: '/winter',
        onSelect: () => {
          open.value = false
        },
      },
      {
        label: 'Courses',
        to: '/courses',
        onSelect: () => {
          open.value = false
        },
      },
    ],
  },
  { label: 'Rentals', to: '/rentals' },
  { label: 'Vouchers', to: '/vouchers' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
].map((item) =>
  item.children
    ? item
    : {
        ...item,
        onSelect: () => {
          open.value = false
        },
      }
)
</script>
<!-- UHeader has fragment roots: target its explicit Alpine classes without a Vue scope attribute. -->
<style>
.alpine-header {
  background: #f3f3efed;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-bottom-width: 0;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.alpine-header--image-route {
  margin-bottom: calc(-1 * var(--ui-header-height, 4rem));
}
.alpine-header--over-image {
  background: transparent;
  color: #fff;
  text-shadow: 0 1px 10px #071c2980;
  border-color: transparent;
  box-shadow: none;
}
.alpine-header--over-image .alpine-header__brand {
  color: #fff;
  text-shadow: 0 1px 12px #071c2950;
}
.alpine-header--over-image .alpine-header__navigation [data-slot='link'],
.alpine-header--over-image [data-slot='toggle'] {
  color: #fff;
}
.alpine-header--over-image
  .alpine-header__navigation
  [data-slot='link']::before {
  background: transparent;
}
.alpine-header--over-image .alpine-header__enquire {
  color: #fff;
  box-shadow: inset 0 0 0 1px #ffffff90;
}
@media (prefers-reduced-motion: reduce) {
  .alpine-header {
    transition: none;
  }
}
.alpine-header__brand {
  font:
    400 clamp(1.05rem, 2vw, 1.3rem) / 1.1 Georgia,
    serif;
  letter-spacing: -0.025em;
  color: #142d35;
}
@media (max-width: 380px) {
  .alpine-header__enquire {
    display: none;
  }
}
</style>
