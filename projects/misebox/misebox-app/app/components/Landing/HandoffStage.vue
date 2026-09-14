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

    <article
      class="misebox-handoff__surface misebox-handoff__surface--workspace"
    >
      <header class="misebox-handoff__surface-header">
        <span>
          <UIcon name="i-lucide-layout-dashboard" aria-hidden="true" />
          Kitchen Workspace
        </span>
        <small>{{ selectedChapterCopy.workspaceLabel }}</small>
      </header>

      <div class="misebox-handoff__workspace" inert>
        <div class="misebox-handoff__workspace-bar">
          <span /><span /><span />
          <strong>{{ productDemo.workspace.kitchenName }}</strong>
        </div>

        <LandingWorkspacePreviewMenus
          v-if="selectedChapter === 'publish'"
          :menus="productDemo.workspace.menus"
          :error="false"
        />
        <LandingWorkspacePreviewOrders
          v-else
          :kitchen-name="productDemo.workspace.kitchenName"
          :orders="productDemo.workspace.orders"
          :error="false"
        />
      </div>
    </article>
  </div>

  <LandingHandoffState v-else-if="pending" />

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
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/menu/composables/useMenuThemeSurface'
import type {
  MenuManifest,
  MenuManifestSection,
} from 'fireux-kitchens/runtime/menu/models/menu-detail.model'
import { useMiseboxProductDemo } from '../../composables/product-demo/useMiseboxProductDemo'
import LandingWorkspacePreviewMenus from './WorkspacePreview/Menus.vue'
import LandingWorkspacePreviewOrders from './WorkspacePreview/Orders.vue'
import LandingHandoffState from './HandoffState.vue'

type HandoffChapter = 'publish' | 'prepare' | 'serve'

const props = defineProps<{
  selectedChapter: HandoffChapter
}>()

const chapterCopy = {
  publish: {
    icon: 'i-lucide-qr-code',
    signal: 'Menu published',
    workspaceLabel: 'Menus',
  },
  prepare: {
    icon: 'i-lucide-receipt-text',
    signal: 'Order received',
    workspaceLabel: 'Orders',
  },
  serve: {
    icon: 'i-lucide-bell-ring',
    signal: 'Order received',
    workspaceLabel: 'Orders',
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
const { className: menuThemeClassName, styleVars: menuThemeStyleVars } =
  useMenuThemeSurface({
    theme: computed(
      () => productDemo.value?.ordering.manifest.presentation.theme
    ),
  })
</script>

<style scoped src="./handoff-stage.css"></style>
