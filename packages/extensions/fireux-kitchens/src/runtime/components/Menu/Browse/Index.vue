<template>
  <article
    class="fireux-menu-detail menu-browse"
    data-menu-projection="browse"
    :class="themeClassName"
    :style="themeStyleVars"
    :aria-labelledby="hasMenu
      ? 'menu-browse-title'
      : failure
        ? 'menu-browse-unavailable-title'
        : undefined"
  >
    <p v-if="pending" class="menu-browse__state" role="status">
      Loading menu…
    </p>

    <MenuBrowseUnavailable
      v-else-if="failure"
      :failure="failure"
      :index-path="menuIndexPath"
    />

    <template v-else-if="hasMenu">
      <MenuBrowseIdentity
        :currency-code="currencyCode"
        :description="menuDescription"
        :identity-kind="documentMenu ? 'menu' : 'kitchen-menu'"
        :image-shade="kitchenImageShade"
        :image-url="kitchenImageUrl"
        :kitchen-name="kitchenName"
        :logo-image-url="kitchenLogoImageUrl"
        :menu-name="menuName"
        :wordmark-image-url="kitchenWordmarkImageUrl"
      />

      <aside class="menu-browse__notice" aria-label="Allergy information">
        <strong>Allergies or intolerances?</strong>
        <span>
          Please ask the kitchen about allergies or dietary requirements.
        </span>
      </aside>

      <template v-if="documentMenu">
        <MenuDetailDocumentViewer
          v-if="documentUrl"
          :menu="documentMenu"
          :menu-id="documentMenu.id"
          :document-url="documentUrl"
          :file-url="documentUrl"
        />

        <p v-else class="menu-browse__state" role="alert">
          Menu document unavailable.
        </p>
      </template>

      <div v-else-if="detailMenu" class="menu-browse__body">
        <MenuBrowseSectionNav
          v-if="browseSections.length > 1"
          :sections="browseSections"
        />

        <div v-if="browseSections.length" class="menu-browse__sections">
          <section
            v-for="section in browseSections"
            :id="section.anchor"
            :key="section.anchor"
            :aria-labelledby="section.headingId"
            class="menu-browse__section"
          >
            <h2 :id="section.headingId" tabindex="-1">
              {{ section.label }}
            </h2>

            <div class="menu-browse__items">
              <MenuBrowseItem
                v-for="item in section.items"
                :key="item.id"
                :currency-code="currencyCode"
                :item="item"
              />
            </div>
          </section>
        </div>

        <p v-else class="menu-browse__state" role="status">
          No menu items are published yet.
        </p>
      </div>
    </template>

    <p v-else class="menu-browse__state" role="alert">
      Menu unavailable.
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useSeoMeta } from '#imports'
import MenuBrowseIdentity from './Identity.vue'
import MenuBrowseSectionNav from './SectionNav.vue'
import MenuBrowseUnavailable from './Unavailable.vue'
import { useMenu } from '../../../composables/fireux/menu/useMenu'
import { useMenuThemeSurface } from '../../../composables/fireux/menu/useMenuThemeSurface'
import type { MenuManifestSection } from '../../../models/kitchen/menu/menu-detail.model'
import {
  menuRouteIndexPath,
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'

type BrowseSection = MenuManifestSection & {
  anchor: string
  headingId: string
}

const props = withDefaults(defineProps<{
  menuId: string
  menuRouteScope?: MenuRouteScope
  propagateResponseStatus?: boolean
}>(), {
  menuRouteScope: rootMenuRouteScope,
  propagateResponseStatus: false,
})

const menuId = computed(() => String(props.menuId || '').trim())
const menuRouteScope = computed(() => props.menuRouteScope)
const kitchenSlug = computed(() =>
  menuRouteScope.value.kind === 'directory'
    ? String(menuRouteScope.value.kitchenSlug || '').trim()
    : ''
)
const menuIndexPath = computed(() => menuRouteIndexPath(menuRouteScope.value))
const {
  pending,
  document: documentMenu,
  manifest: detailMenu,
  failure,
  ready,
} = useMenu(menuId, { routeScope: menuRouteScope })

if (props.propagateResponseStatus) {
  await ready
  if (import.meta.server && failure.value) {
    setResponseStatus(failure.value.statusCode)
  }
}

const hasMenu = computed(() => Boolean(documentMenu.value || detailMenu.value))
const menuName = computed(() =>
  detailMenu.value?.content.name || documentMenu.value?.name || 'Menu'
)
const menuDescription = computed(() =>
  detailMenu.value?.content.description || documentMenu.value?.description || ''
)
const menuPresentation = computed(() =>
  detailMenu.value?.presentation || documentMenu.value || null
)
const kitchenName = computed(() =>
  menuPresentation.value?.kitchenName || ''
)
const currencyCode = computed(() =>
  String(menuPresentation.value?.currencyCode || '').trim().toUpperCase()
)
const kitchenImageShade = computed(() =>
  menuPresentation.value?.kitchenImageShade || 'none'
)
const kitchenImageUrl = computed(() =>
  String(menuPresentation.value?.kitchenImageUrl || '').trim()
)
const kitchenLogoImageUrl = computed(() =>
  String(menuPresentation.value?.kitchenLogoImageUrl || '').trim()
)
const kitchenWordmarkImageUrl = computed(() =>
  String(menuPresentation.value?.kitchenWordmarkImageUrl || '').trim()
)
const pageStyle = computed(() =>
  menuPresentation.value?.pageStyle || null
)
const browseSections = computed<BrowseSection[]>(() =>
  browseSectionLinks(detailMenu.value?.content.sections ?? [])
)
const documentUrl = computed(() => {
  const file = documentMenu.value?.file
  if (!file?.storage_path || !menuId.value) return file?.url || ''

  const query = new URLSearchParams()
  if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
  const qs = query.toString()

  return `/api/menus/${encodeURIComponent(menuId.value)}/file${qs ? `?${qs}` : ''}`
})
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({ pageStyle })

useSeoMeta({
  title: () => failure.value?.title || menuName.value,
  description: () => failure.value?.description ||
    menuDescription.value || `Browse ${menuName.value}.`,
  ogTitle: () => failure.value?.title || menuName.value,
  ogDescription: () => failure.value?.description ||
    menuDescription.value || `Browse ${menuName.value}.`,
  robots: () => failure.value ? 'noindex, nofollow' : undefined,
})

function sectionAnchor(section: MenuManifestSection, index: number) {
  const slug = String(section.id || section.label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `menu-section-${slug || `section-${index + 1}`}`
}

function browseSectionLinks(sections: MenuManifestSection[]) {
  const anchors = new Set<string>()

  return sections.map((section, index) => {
    const baseAnchor = sectionAnchor(section, index)
    let anchor = baseAnchor
    let collision = 2

    while (anchors.has(anchor)) {
      anchor = `${baseAnchor}-${collision}`
      collision += 1
    }
    anchors.add(anchor)

    return {
      ...section,
      anchor,
      headingId: `${anchor}-title`,
    }
  })
}
</script>

<style scoped>
.menu-browse {
  --menu-browse-nav-top: max(0.5rem, env(safe-area-inset-top));

  align-content: start;
}

.menu-browse__state {
  margin: auto;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
}

.menu-browse__notice {
  display: grid;
  width: min(100%, 48rem);
  margin: 0 auto;
  padding: 0.9rem 1rem;
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 30%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-secondary) 7%, transparent);
  color: var(--menu-muted);
  font-size: 0.84rem;
  line-height: 1.5;
  text-align: left;
}

.menu-browse__notice strong {
  color: var(--menu-text);
}

.menu-browse__body {
  display: grid;
  gap: clamp(2rem, 5vw, 4rem);
  width: min(100%, 54rem);
  margin: 0 auto;
  text-align: left;
}

.menu-browse__sections,
.menu-browse__section,
.menu-browse__items {
  display: grid;
}

.menu-browse__sections {
  gap: clamp(3rem, 7vw, 5rem);
}

.menu-browse__section {
  gap: 1rem;
  scroll-margin-block-start: calc(var(--menu-browse-nav-top) + 4.25rem);
}

.menu-browse__section h2 {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  line-height: 1.3;
  text-transform: uppercase;
}

.menu-browse__section h2:focus-visible {
  border-radius: 0.2rem;
  outline: 2px solid var(--menu-secondary);
  outline-offset: 0.35rem;
}

.menu-browse__items {
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
}
</style>
