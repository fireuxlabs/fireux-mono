<template>
  <section
    class="menu-order-kiosk-catalogue"
    data-menu-order-catalogue="selectable"
    :data-menu-kiosk-view="activeSection ? 'section' : 'landing'"
    aria-label="Menu items"
    @keydown.esc="closeDrawer"
  >
    <header class="menu-order-kiosk-catalogue__chrome">
      <button
        type="button"
        aria-label="Change order type"
        @click="$emit('restart')"
      >
        <UIcon name="i-lucide-chevron-left" aria-hidden="true" />
        Change
      </button>
      <div class="menu-order-kiosk-catalogue__brand">
        <img
          v-if="logoImageUrl"
          :src="logoImageUrl"
          :alt="kitchenName || 'Kitchen'"
        />
        <strong v-else>{{ kitchenName || 'Menu' }}</strong>
      </div>
      <span class="menu-order-kiosk-catalogue__mode">
        <UIcon
          :name="
            orderType === 'eat_in'
              ? 'i-lucide-armchair'
              : 'i-lucide-shopping-bag'
          "
          aria-hidden="true"
        />
        {{ orderType === 'eat_in' ? 'Eat here' : 'Take away' }}
      </span>
    </header>

    <template v-if="catalogueSections.length">
      <main
        v-if="!activeSection"
        class="menu-order-kiosk-catalogue__landing"
        :style="catalogueBackgroundStyle"
      >
        <div class="menu-order-kiosk-catalogue__families">
          <section
            v-for="family in catalogueFamilies"
            :key="family.id"
            :aria-labelledby="`menu-kiosk-family-${family.id}`"
            class="menu-order-kiosk-catalogue__family"
            :data-menu-kiosk-family="family.id"
          >
            <h3 :id="`menu-kiosk-family-${family.id}`">
              {{ family.label }}
            </h3>
            <div>
              <button
                v-for="section in family.sections"
                :key="section.anchor"
                type="button"
                :aria-label="`${section.label}, ${section.items.length} items`"
                :class="{
                  'menu-order-kiosk-catalogue__section--art':
                    !usesComposedCard(section) && sectionCardImageUrl(section),
                  'menu-order-kiosk-catalogue__section--composed':
                    usesComposedCard(section),
                }"
                :data-menu-kiosk-section="section.id"
                @click="selectSection(section.anchor)"
              >
                <span
                  class="menu-order-kiosk-catalogue__section-image"
                  aria-hidden="true"
                >
                  <img
                    v-if="usesComposedCard(section)"
                    class="menu-order-kiosk-catalogue__section-product"
                    :src="sectionImageUrl(section)"
                    alt=""
                  />
                  <img
                    v-else-if="
                      sectionCardImageUrl(section) || sectionImageUrl(section)
                    "
                    :src="
                      sectionCardImageUrl(section) || sectionImageUrl(section)
                    "
                    alt=""
                  />
                  <img
                    v-if="usesComposedCard(section)"
                    class="menu-order-kiosk-catalogue__section-frame"
                    :src="sectionCardFrameImageUrl"
                    alt=""
                  />
                </span>
                <span
                  v-if="
                    usesComposedCard(section) || !sectionCardImageUrl(section)
                  "
                  class="menu-order-kiosk-catalogue__section-copy"
                >
                  <strong>{{ section.label }}</strong>
                  <small v-if="!usesComposedCard(section)"
                    >{{ section.items.length }} items</small
                  >
                </span>
                <UIcon
                  v-if="
                    !usesComposedCard(section) && !sectionCardImageUrl(section)
                  "
                  name="i-lucide-chevron-right"
                  aria-hidden="true"
                />
              </button>
            </div>
          </section>
        </div>
      </main>

      <main
        v-else
        :id="activeSection.anchor"
        class="menu-order-kiosk-catalogue__content"
        :style="catalogueBackgroundStyle"
        :aria-labelledby="activeSection.headingId"
      >
        <header class="menu-order-kiosk-catalogue__header">
          <div class="menu-order-kiosk-catalogue__actions">
            <button type="button" @click="showLanding">
              <UIcon name="i-lucide-layout-grid" aria-hidden="true" />
              All sections
            </button>
            <button ref="drawerTrigger" type="button" @click="openDrawer">
              <UIcon name="i-lucide-menu" aria-hidden="true" />
              Browse sections
            </button>
          </div>
          <h2 :id="activeSection.headingId">{{ activeSection.label }}</h2>
        </header>

        <div class="menu-order-kiosk-catalogue__items">
          <MenuOrderKioskItem
            v-for="item in activeSection.items"
            :key="item.id"
            :currency-code="currencyCode"
            :item="item"
            @add="addItem"
            @select="openItem(item, $event)"
          />
        </div>
      </main>

      <div
        v-if="drawerOpen"
        class="menu-order-kiosk-catalogue__drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-kiosk-drawer-title"
      >
        <button
          type="button"
          class="menu-order-kiosk-catalogue__drawer-shade"
          aria-label="Close menu sections"
          @click="closeDrawer"
        />
        <aside>
          <header>
            <h2 id="menu-kiosk-drawer-title">Menu</h2>
            <button
              ref="drawerClose"
              type="button"
              aria-label="Close menu sections"
              @click="closeDrawer"
            >
              <UIcon name="i-lucide-x" aria-hidden="true" />
            </button>
          </header>
          <nav aria-label="Menu sections">
            <section v-for="family in catalogueFamilies" :key="family.id">
              <h3>{{ family.label }}</h3>
              <button
                v-for="section in family.sections"
                :key="section.anchor"
                type="button"
                :class="{
                  'menu-order-kiosk-catalogue__drawer-active':
                    section.anchor === activeSection?.anchor,
                }"
                :aria-current="
                  section.anchor === activeSection?.anchor ? 'page' : undefined
                "
                @click="selectSection(section.anchor)"
              >
                {{ section.label }}
              </button>
            </section>
          </nav>
        </aside>
      </div>
    </template>

    <p v-else class="menu-order-kiosk-catalogue__empty" role="status">
      No menu items are currently available.
    </p>

    <MenuOrderItemDialog
      v-if="activeItem"
      v-model:open="dialogOpen"
      :currency-code="currencyCode"
      :initial-variant-id="activeVariantId"
      :item="activeItem"
      @add="addItem"
      @after-leave="finishDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../models/menu-detail.model.ts'
import type { MenuOrderBasketInput } from '../../../composables/order/useMenuOrderBasket'
import type { MenuOrderKioskType } from '../../../composables/order/useMenuOrderKiosk'
import {
  menuSectionLinks,
  type MenuSectionLink,
} from '../../../utils/menu-section-links'
import { menuCatalogueFamilies } from '../../../utils/menu-catalogue-families'

type MenuOrderItemSelection = {
  trigger: HTMLButtonElement
  variantId?: string
}

const props = defineProps<{
  catalogueBackgroundImageUrl?: string
  currencyCode: string
  kitchenName?: string
  logoImageUrl?: string
  orderType: MenuOrderKioskType
  sections: MenuManifestSection[]
  sectionCardFrameImageUrl?: string
  sectionCardImageUrls?: Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'add', input: MenuOrderBasketInput): void
  (event: 'restart'): void
}>()

const activeSectionAnchor = ref('')
const activeItem = shallowRef<MenuManifestItem | null>(null)
const activeTrigger = shallowRef<HTMLButtonElement | null>(null)
const activeVariantId = ref('')
const dialogOpen = ref(false)
const drawerOpen = ref(false)
const drawerTrigger = shallowRef<HTMLButtonElement | null>(null)
const drawerClose = shallowRef<HTMLButtonElement | null>(null)
const catalogueSections = computed<MenuSectionLink[]>(() =>
  menuSectionLinks(props.sections).filter((section) => section.items.length)
)
const catalogueFamilies = computed(() =>
  menuCatalogueFamilies(catalogueSections.value)
)
const activeSection = computed(
  () =>
    catalogueSections.value.find(
      (section) => section.anchor === activeSectionAnchor.value
    ) || null
)
const catalogueBackgroundStyle = computed(() => {
  const imageUrl = String(props.catalogueBackgroundImageUrl || '').trim()

  return imageUrl
    ? { '--menu-kiosk-catalogue-background-image': `url("${imageUrl}")` }
    : undefined
})

function sectionImageUrl(section: { items: MenuManifestItem[] }) {
  return String(
    section.items.find((item) => String(item.imageUrl || '').trim())
      ?.imageUrl || ''
  ).trim()
}

function sectionCardImageUrl(section: { id: string; label: string }) {
  const keys = [section.id, section.label].map((value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  )

  return String(
    keys.map((key) => props.sectionCardImageUrls?.[key]).find(Boolean) || ''
  ).trim()
}

function usesComposedCard(section: { items: MenuManifestItem[] }) {
  return Boolean(
    String(props.sectionCardFrameImageUrl || '').trim() &&
      sectionImageUrl(section)
  )
}

function selectSection(anchor: string) {
  if (!catalogueSections.value.some((section) => section.anchor === anchor))
    return
  activeSectionAnchor.value = anchor
  closeDrawer()
}

function showLanding() {
  activeSectionAnchor.value = ''
  closeDrawer()
}

function openDrawer() {
  drawerOpen.value = true
  void nextTick(() => drawerClose.value?.focus())
}

function closeDrawer() {
  if (!drawerOpen.value) return
  drawerOpen.value = false
  void nextTick(() => drawerTrigger.value?.focus())
}

watch(
  catalogueSections,
  (sections: MenuSectionLink[]) => {
    if (!activeSectionAnchor.value) return
    if (
      sections.some((section) => section.anchor === activeSectionAnchor.value)
    )
      return
    activeSectionAnchor.value = ''
  },
  { immediate: true }
)

function openItem(item: MenuManifestItem, selection: MenuOrderItemSelection) {
  activeItem.value = item
  activeTrigger.value = selection.trigger
  activeVariantId.value = selection.variantId || ''
  dialogOpen.value = true
}

function addItem(input: MenuOrderBasketInput) {
  emit('add', input)
  dialogOpen.value = false
}

function finishDialog() {
  const trigger = activeTrigger.value
  activeItem.value = null
  activeTrigger.value = null
  activeVariantId.value = ''
  void nextTick(() => trigger?.focus())
}
</script>

<style scoped>
@import './catalogue-chrome.css';
@import './catalogue.css';
</style>
