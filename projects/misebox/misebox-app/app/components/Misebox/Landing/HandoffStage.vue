<template>
  <div
    v-if="productDemo"
    class="misebox-handoff__stage"
    :data-handoff-chapter="selectedChapter"
  >
    <article class="misebox-handoff__surface misebox-handoff__surface--guest">
      <header class="misebox-handoff__surface-header">
        <span>
          <UIcon name="i-lucide-smartphone" aria-hidden="true" />
          Guest Menu
        </span>
        <small>Published</small>
      </header>

      <div
        class="misebox-handoff__phone"
        :class="menuThemeClassName"
        :style="menuThemeStyleVars"
        inert
      >
        <div class="misebox-handoff__phone-bar"><span /></div>
        <div class="misebox-handoff__phone-copy">
          <strong>{{ menuManifest.presentation.kitchenName }}</strong>
          <small>{{ menuManifest.content.name }}</small>
        </div>
        <MenuOrderCatalogue
          :currency-code="menuManifest.presentation.currencyCode"
          :sections="menuSections"
        />
      </div>
    </article>

    <div class="misebox-handoff__connection" aria-hidden="true">
      <span />
      <div :key="selectedChapter">
        <UIcon :name="selectedChapterCopy.icon" />
        <small>{{ selectedChapterCopy.signal }}</small>
      </div>
      <UIcon name="i-lucide-arrow-right" />
    </div>

    <article class="misebox-handoff__surface misebox-handoff__surface--console">
      <header class="misebox-handoff__surface-header">
        <span>
          <UIcon name="i-lucide-layout-dashboard" aria-hidden="true" />
          Kitchen Console
        </span>
        <small>{{ selectedChapterCopy.consoleLabel }}</small>
      </header>

      <div class="misebox-handoff__console" inert>
        <div class="misebox-handoff__console-bar">
          <span /><span /><span />
          <strong>{{ productDemo.console.kitchenName }}</strong>
        </div>

        <MiseboxLandingConsolePreviewMenus
          v-if="selectedChapter === 'publish'"
          :menus="productDemo.console.menus"
          :error="false"
        />
        <MiseboxLandingConsolePreviewMise
          v-else-if="selectedChapter === 'prepare'"
          :kitchen-name="productDemo.console.kitchenName"
          :tasks="previewMiseTasks"
        />
        <MiseboxLandingConsolePreviewOrders
          v-else
          :kitchen-name="productDemo.console.kitchenName"
          :orders="productDemo.console.orders"
          :error="false"
        />
      </div>
    </article>
  </div>

  <MiseboxLandingHandoffState v-else-if="pending" />

  <UAlert
    v-else
    color="neutral"
    variant="soft"
    title="Product demonstration unavailable"
    description="The Misebox Demo Kitchen could not be loaded."
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/composables/fireux/menu/useMenuThemeSurface'
import type {
  MenuManifest,
  MenuManifestSection,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'
import { useMiseboxProductDemo } from '../../../composables/product-demo/useMiseboxProductDemo'
import MiseboxLandingConsolePreviewMenus from './ConsolePreview/Menus.vue'
import MiseboxLandingConsolePreviewMise from './ConsolePreview/Mise.vue'
import MiseboxLandingConsolePreviewOrders from './ConsolePreview/Orders.vue'
import MiseboxLandingHandoffState from './HandoffState.vue'

type HandoffChapter = 'publish' | 'prepare' | 'serve'

const props = defineProps<{
  selectedChapter: HandoffChapter
}>()

const chapterCopy = {
  publish: {
    icon: 'i-lucide-qr-code',
    signal: 'Menu published',
    consoleLabel: 'Menus',
  },
  prepare: {
    icon: 'i-lucide-list-checks',
    signal: 'Prep connected',
    consoleLabel: 'Mise en place',
  },
  serve: {
    icon: 'i-lucide-bell-ring',
    signal: 'Order received',
    consoleLabel: 'Orders',
  },
} as const

const { data: productDemo, pending } = await useMiseboxProductDemo()
const selectedChapterCopy = computed(() => chapterCopy[props.selectedChapter])
const menuManifest = computed<MenuManifest>(
  () => productDemo.value!.ordering.manifest
)
const menuSections = computed<MenuManifestSection[]>(() =>
  menuManifest.value.content.sections.slice(0, 2).map((section) => ({
    ...section,
    items: section.items.slice(0, 1),
  }))
)
const previewMiseTasks = computed(
  () => productDemo.value?.console.miseTasks.slice(0, 6) || []
)
const { className: menuThemeClassName, styleVars: menuThemeStyleVars } =
  useMenuThemeSurface({
    pageStyle: computed(
      () => productDemo.value?.ordering.manifest.presentation.pageStyle
    ),
    colorMode: 'light',
  })
</script>

<style scoped src="./handoff-stage.css"></style>
