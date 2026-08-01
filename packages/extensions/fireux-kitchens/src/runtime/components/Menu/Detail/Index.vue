<template>
  <div
    class="fireux-menu-detail menu-detail"
    :class="[
      themeClassName,
      {
        'menu-detail--kiosk': isKioskMenu,
        'menu-detail--staff-pos': isStaffPosMenu,
      },
    ]"
    :style="themeStyleVars"
    :dir="menuDirection"
    :lang="menuLanguage || undefined"
  >
    <p v-if="pending" class="menu-detail__state">
      Loading menu...
    </p>

    <p v-else-if="error" class="menu-detail__state">
      Menu unavailable.
    </p>

    <MenuDetailDocument
      v-else-if="renderKind === 'document' && documentMenu"
      :kitchen-name="documentKitchenName"
      :menu="documentMenu"
      :document-url="documentUrl"
    />

    <template v-else-if="detailMenu">
      <ClientOnly>
        <div
          v-if="detailMenu.sproochli"
          class="menu-detail__translation"
        >
          <SproochliLanguageTrigger
            :language-options="sproochliLanguageOptions"
            :selected-language="detailMenu.sproochli.language"
            default-language="mixed"
            :show-group-labels="true"
          />
          <span
            v-if="detailMenu.sproochli.state === 'unavailable'"
            class="menu-detail__translation-state menu-detail__translation-state--error"
          >
            Translation unavailable. Showing original.
          </span>
        </div>
      </ClientOnly>

      <MenuDetailFood
        :menu="detailMenu"
        :menu-id="menuId"
        :menu-context="menuContext"
        :menu-route-scope="props.menuRouteScope"
      />
    </template>

    <p v-else class="menu-detail__state">
      Menu unavailable.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import {
  isSproochliRtlLanguage,
  normalizeSproochliLanguage,
  resolveSproochliLanguageState,
} from 'fireux-sproochli/runtime/sproochli'
import { useMenu } from '../../../composables/fireux/menu/useMenu'
import { useMenuThemeSurface } from '../../../composables/fireux/menu/useMenuThemeSurface'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'
import {
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import { menuContextProfile } from '../../../utils/menu-context'

const props = withDefaults(
  defineProps<{
    menuId: string
    menuContext?: MenuRouteContext
    menuRouteScope?: MenuRouteScope
  }>(),
  {
    menuRouteScope: rootMenuRouteScope,
  }
)

const menuId = computed(() => props.menuId)
const route = useRoute()
const sproochliLanguage = computed(() =>
  normalizeSproochliLanguage(route.query.sproochli)
)
const menuContext = computed(() => props.menuContext)
const menuRouteScope = computed(() => props.menuRouteScope)
const kitchenSlug = computed(() =>
  menuRouteScope.value.kind === 'directory'
    ? menuRouteScope.value.kitchenSlug
    : ''
)
const {
  pending,
  error,
  renderKind,
  document: documentMenu,
  manifest: detailMenu,
} = useMenu(menuId, {
  menuContext,
  routeScope: menuRouteScope,
  sproochliLanguage,
})
const sproochliLanguageOptions = computed(() =>
  resolveSproochliLanguageState({
    enabled: true,
    cachedLanguages: detailMenu.value?.sproochli?.readyLanguages ?? [],
  }).options
)
const menuLanguage = computed(() =>
  detailMenu.value?.sproochli?.state === 'translated'
    ? detailMenu.value.sproochli.language
    : ''
)
const menuDirection = computed(() =>
  detailMenu.value?.sproochli?.state === 'translated' &&
  isSproochliRtlLanguage(detailMenu.value.sproochli.language)
    ? 'rtl'
    : 'ltr'
)
const documentKitchenName = computed(() =>
  documentMenu.value?.kitchenName || ''
)
const documentUrl = computed(() => {
  const file = documentMenu.value?.file
  if (file?.url) return file.url
  if (!file?.storage_path || !menuId.value) return ''

  const query = new URLSearchParams()
  if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
  const qs = query.toString()

  return `/api/menus/${encodeURIComponent(menuId.value)}/file${qs ? `?${qs}` : ''}`
})
const pageStyle = computed(() =>
  detailMenu.value?.presentation.pageStyle ||
  documentMenu.value?.pageStyle ||
  null
)
const isKioskMenu = computed(() =>
  menuContextProfile(menuContext.value).surface === 'kiosk' ||
    detailMenu.value?.behaviour.surface === 'kiosk'
)
const isStaffPosMenu = computed(() =>
  menuContextProfile(menuContext.value).surface === 'staff_pos' ||
    detailMenu.value?.behaviour.surface === 'staff_pos'
)
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({ pageStyle })
</script>

<style scoped>
.menu-detail__state {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.menu-detail__translation {
  display: flex;
  min-height: 3rem;
  align-items: center;
  justify-content: flex-end;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4) 0;
}

.menu-detail__translation-state {
  color: var(--menu-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.menu-detail__translation-state--error {
  color: var(--ui-color-error-600);
}

.menu-detail--kiosk .menu-detail__translation {
  position: absolute;
  z-index: 20;
  inset-block-start: 1rem;
  inset-inline-start: 1rem;
  justify-content: flex-start;
  padding: 0;
}

.menu-detail--kiosk .menu-detail__translation-state {
  color: rgb(255 255 255 / 78%);
}
</style>
