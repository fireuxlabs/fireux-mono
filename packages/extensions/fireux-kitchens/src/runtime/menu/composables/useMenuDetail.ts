import { promotionPricedSections } from '../../kitchen/utils/promotions/pricing'
import { useKitchenOfferingNow } from '../../kitchen/composables/useKitchenOfferingNow'
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import type { CurrencyDisplayFormat } from '../../models/shared/currency-display.model.ts'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import {
  isSproochliRtlLanguage,
  normalizeSproochliLanguage,
  resolveSproochliLanguageState,
} from 'fireux-sproochli/runtime/sproochli'
import { useMenu } from './useMenu'
import { useMenuThemeSurface } from './useMenuThemeSurface'
import { resolveMenuBrowseSurfaceCopy } from '../utils/menu-surface-copy'
import { menuCanonicalPath, type MenuRouteScope } from '../utils/menu-route'
import { guestMenuSurfaceOptions } from '../utils/menu-context'

export function useMenuDetail(props: {
  menuId: string
  menuRouteScope: MenuRouteScope
  pageCanvas: boolean
  propagateResponseStatus: boolean
}) {
  const route = useRoute()
  const menuId = computed(() => String(props.menuId || '').trim())
  const menuRouteScope = computed(() => props.menuRouteScope)
  const requestedSproochliLanguage = computed(() =>
    normalizeSproochliLanguage(route.query.sproochli)
  )
  const {
    pending,
    offeringId,
    kitchenSlug,
    indexPath: menuIndexPath,
    menuPath,
    renderKind,
    document: documentMenu,
    manifest: detailMenu,
    failure,
    ready,
  } = useMenu(menuId, {
    routeScope: menuRouteScope,
    sproochliLanguage: requestedSproochliLanguage,
  })
  const browseSurfaceCopy = computed(
    () =>
      detailMenu.value?.sproochli?.surfaceCopy ?? resolveMenuBrowseSurfaceCopy()
  )

  const hasMenu = computed(() => renderKind.value !== 'unavailable')
  const { now: pricingNow } = useKitchenOfferingNow()
  const activeDetailMenu = computed(() => {
    const manifest = detailMenu.value
    return manifest
      ? {
          ...manifest,
          content: {
            ...manifest.content,
            sections: promotionPricedSections(
              manifest.content.sections,
              manifest.content.promotions,
              pricingNow.value
            ),
          },
        }
      : null
  })
  const menuName = computed(
    () =>
      activeDetailMenu.value?.content.name || documentMenu.value?.name || 'Menu'
  )
  const menuDescription = computed(
    () =>
      activeDetailMenu.value?.content.description ||
      documentMenu.value?.description ||
      ''
  )
  const menuPresentation = computed(
    () => activeDetailMenu.value?.presentation || documentMenu.value || null
  )
  const kitchenName = computed(() => menuPresentation.value?.kitchenName || '')
  const logoFailed = ref(false)
  const kitchenLogoUrl = computed(
    () => activeDetailMenu.value?.presentation.kitchenLogoImageUrl || ''
  )
  const logoStyle = computed(() => ({
    backgroundColor:
      activeDetailMenu.value?.presentation.kitchenMediaBackdropColor ||
      'transparent',
  }))
  watch(kitchenLogoUrl, () => {
    logoFailed.value = false
  })
  const currencyCode = computed(() =>
    String(menuPresentation.value?.currencyCode || '')
      .trim()
      .toUpperCase()
  )
  const currencyFormat = computed<CurrencyDisplayFormat>(() => {
    const format = menuPresentation.value?.currencyFormat

    return format === 'symbol' || format === 'code' ? format : 'dash'
  })
  const showCurrency = computed(
    () => menuPresentation.value?.showCurrency !== false
  )
  const theme = computed(() => menuPresentation.value?.theme || null)
  const canonicalPath = computed(() =>
    menuCanonicalPath({
      scope: menuRouteScope.value,
      menuId: menuId.value,
      sourceKitchenSlug: detailMenu.value?.source.kitchenSlug,
      sourceMenuSlug: detailMenu.value?.source.menuSlug,
    })
  )
  const sproochli = computed(() => {
    return detailMenu.value?.sproochli ?? null
  })
  const sproochliLanguageOptions = computed(
    () =>
      resolveSproochliLanguageState({
        enabled: true,
        defaultLanguage: sproochli.value?.defaultLanguage,
        cachedLanguages: sproochli.value?.readyLanguages ?? [],
      }).options
  )
  const menuLanguage = computed(() =>
    sproochli.value?.state === 'translated' ? sproochli.value.language : ''
  )
  const menuDirection = computed(() =>
    sproochli.value?.state === 'translated' &&
    isSproochliRtlLanguage(sproochli.value.language)
      ? 'rtl'
      : 'ltr'
  )
  const menuDebug = computed(() => ({
    menu_id: menuId.value,
    route_scope: menuRouteScope.value,
    render_kind: renderKind.value,
    source: activeDetailMenu.value?.source ?? null,
    sproochli: {
      state: sproochli.value?.state ?? 'off',
      language: sproochli.value?.language || 'Default',
      default_language: sproochli.value?.defaultLanguage ?? null,
      ready_languages: sproochli.value?.readyLanguages ?? null,
    },
  }))
  const preserveSproochliQuery = (to: string) => {
    const language = sproochli.value?.language
    if (!language) return to

    const [pathAndQuery = '', hash = ''] = String(to || '').split('#', 2)
    const [path, query = ''] = pathAndQuery.split('?', 2)
    const params = new URLSearchParams(query)
    params.set('sproochli', language)
    const nextQuery = params.toString()

    return `${path}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`
  }
  const orderingSurfaceOptions = computed(() =>
    guestMenuSurfaceOptions({
      behaviour: detailMenu.value?.behaviour,
      menuId: menuId.value,
      routeScope: menuRouteScope.value,
      activeContext: 'generic',
      activeOfferingId: offeringId.value,
    })
      .filter((option) => option.value !== 'generic')
      .map((option) => ({
        ...option,
        to: preserveSproochliQuery(option.to),
      }))
  )
  const documentUrl = computed(() => {
    const file = documentMenu.value?.file
    if (!file?.storage_path || !menuId.value) return file?.url || ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
    const qs = query.toString()

    return `/api/menus/${encodeURIComponent(menuId.value)}/file${qs ? `?${qs}` : ''}`
  })
  const { className: themeClassName, styleVars: themeStyleVars } =
    useMenuThemeSurface({
      theme,
      pageCanvas: computed(() => props.pageCanvas),
    })

  useSeo({
    title: () => failure.value?.title || menuName.value,
    description: () =>
      failure.value?.description ||
      menuDescription.value ||
      `Browse ${menuName.value}.`,
    path: canonicalPath,
    robots: () =>
      failure.value ||
      detailMenu.value?.content.audience ||
      documentMenu.value?.audience
        ? 'noindex, nofollow'
        : undefined,
  })

  return {
    ready,
    sproochli,
    detailMenu,
    pending,
    menuIndexPath,
    menuPath,
    renderKind,
    documentMenu,
    failure,
    browseSurfaceCopy,
    hasMenu,
    activeDetailMenu,
    menuName,
    menuDescription,
    kitchenName,
    logoFailed,
    kitchenLogoUrl,
    logoStyle,
    currencyCode,
    currencyFormat,
    showCurrency,
    sproochliLanguageOptions,
    menuLanguage,
    menuDirection,
    menuDebug,
    orderingSurfaceOptions,
    documentUrl,
    themeClassName,
    themeStyleVars,
  }
}
