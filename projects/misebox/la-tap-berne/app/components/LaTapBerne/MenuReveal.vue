<template>
  <div class="pointer-events-none absolute inset-0 z-20">
    <Transition name="content-fade">
      <div
        v-if="!isOpen"
        class="pointer-events-auto absolute inset-x-0 top-1/4 z-[2] flex -translate-y-1/2 justify-center"
      >
        <button
          class="latap-glass flex min-h-[4.25rem] cursor-pointer items-center justify-start gap-3 rounded-2xl px-4 py-3"
          type="button"
          @click="openMenu"
        >
          <UIcon name="i-ph-fork-knife" class="size-5 shrink-0" />
          <span class="grid min-w-32 gap-0.5 text-left">
            <span class="text-sm font-black uppercase leading-none tracking-wider">
              View menu
            </span>
            <small class="font-serif text-sm font-semibold italic leading-none opacity-[0.84]">
              Comida Casera
            </small>
          </span>
        </button>
      </div>
    </Transition>

    <Transition name="menu-pop">
      <section
        v-if="isOpen"
        class="pointer-events-auto fixed inset-0 z-[100] overflow-auto overscroll-contain bg-transparent p-0 text-[var(--brand-ink)]"
        aria-label="La Tap Berne menu"
        >
        <button
          class="latap-menu-close latap-glass fixed right-4 top-4 z-[101] sm:right-8 sm:top-8"
          type="button"
          aria-label="Close menu"
          @click="closeMenu"
        >
          <UIcon name="i-lucide-x" />
        </button>

        <MenuDetail
          menu-id="main"
          kitchen-slug="la-tapberne"
        />
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useMiseboxTenantChrome } from 'fireux-misebox/runtime/composables/fireux/app/useMiseboxTenantChrome'
import { onBeforeUnmount, ref } from 'vue'

const { setChromeHidden } = useMiseboxTenantChrome()
const isOpen = ref(false)

const openMenu = () => {
  isOpen.value = true
  setChromeHidden(true)
}

const closeMenu = () => {
  isOpen.value = false
  setChromeHidden(false)
}

onBeforeUnmount(() => {
  setChromeHidden(false)
})
</script>

<style scoped>
.menu-pop-enter-active,
.menu-pop-leave-active {
  transition:
    opacity 260ms ease,
    transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(1.5rem) scale(0.94);
}

.content-fade-enter-active,
.content-fade-leave-active {
  transition: opacity 180ms ease;
}

.content-fade-enter-from,
.content-fade-leave-to {
  opacity: 0;
}
</style>
