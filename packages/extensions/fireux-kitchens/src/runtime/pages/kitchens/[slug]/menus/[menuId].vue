<template>
  <div class="contents">
    <UPageCard v-if="detailPending" class="mx-auto mt-8 max-w-3xl" variant="subtle">
      <p class="text-sm text-dimmed">Loading menu...</p>
    </UPageCard>

    <UAlert
      v-else-if="!kitchen || !menu"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu is missing, unpublished, or no longer available."
    />

    <MenuPublic
      v-else
      :kitchen-name="kitchen.name"
      :menu="menu"
      :sections="sectionRows"
      :page-style="kitchen.style"
      :public-menu-polish="kitchen.public_menu_polish"
      :currency-code="kitchen.currency_code"
      :currency-format="currencyFormat"
    />

    <DevJson
      v-if="isDev"
      class="mx-auto my-8 max-w-3xl"
      title="Kitchen public menu detail debug"
      context="Kitchen menu detail · /kitchens/[slug]/menus/[menuId]"
      :data="pageDebug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useKitchenPublicMenuDetail } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { KitchenPublicMenuPolish } from '../../../../models/kitchen.model'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
})

const {
  detailPending,
  kitchen,
  menu,
  sectionRows,
  debug,
} = useKitchenPublicMenuDetail()
const isDev = import.meta.dev

const defaultMenuStyle = {
  backgroundColorLight: '#fffaf2',
  backgroundColorDark: '#171717',
  fontColorLight: '#211915',
  fontColorDark: '#f8f1e8',
  primaryColor: 'var(--ui-primary)',
  secondaryColor: 'color-mix(in srgb, var(--menu-accent) 70%, var(--menu-text))',
} as const

const text = (value: unknown) => String(value ?? '').trim()
const currencyFormat = computed(
  () => (text(kitchen.value?.currency_format) || 'dash') as CurrencyDisplayFormat
)
const kitchenStyle = computed<Partial<PageStyle>>(() => {
  const style = kitchen.value?.style
  return style && typeof style === 'object' ? style : {}
})
const publicMenuPolish = computed<Partial<KitchenPublicMenuPolish>>(() => {
  const polish = kitchen.value?.public_menu_polish
  return polish && typeof polish === 'object' ? polish : {}
})
const expectedStyle = computed(() => {
  const style = kitchenStyle.value

  return {
    light: {
      background: text(style.background_color_light) || defaultMenuStyle.backgroundColorLight,
      text: text(style.font_color_light) || defaultMenuStyle.fontColorLight,
    },
    dark: {
      background: text(style.background_color_dark) || defaultMenuStyle.backgroundColorDark,
      text: text(style.font_color_dark) || defaultMenuStyle.fontColorDark,
    },
    shared: {
      primary: text(style.primary_color) || defaultMenuStyle.primaryColor,
      secondary: text(style.secondary_color) || defaultMenuStyle.secondaryColor,
    },
  }
})
const activeColorScheme = ref<'light' | 'dark' | 'unknown'>('unknown')
const renderedStyle = ref<Record<string, unknown>>({
  found: false,
})

const readRenderedStyle = async () => {
  if (!import.meta.client) return

  await nextTick()

  const root = document.querySelector<HTMLElement>('.public-menu')
  const page = document.querySelector<HTMLElement>('.menu-page')
  if (!root) {
    renderedStyle.value = {
      found: false,
      activeColorScheme: activeColorScheme.value,
    }
    return
  }

  const styles = getComputedStyle(root)
  const pageStyles = page ? getComputedStyle(page) : null
  renderedStyle.value = {
    found: true,
    activeColorScheme: activeColorScheme.value,
    background: styles.backgroundColor,
    text: styles.color,
    vars: {
      menuBg: styles.getPropertyValue('--menu-bg').trim(),
      menuBgLight: styles.getPropertyValue('--menu-bg-light').trim(),
      menuBgDark: styles.getPropertyValue('--menu-bg-dark').trim(),
      menuText: styles.getPropertyValue('--menu-text').trim(),
      menuTextDark: styles.getPropertyValue('--menu-text-dark').trim(),
      menuTextLight: styles.getPropertyValue('--menu-text-light').trim(),
      menuAccent: styles.getPropertyValue('--menu-accent').trim(),
      menuSecondary: styles.getPropertyValue('--menu-secondary').trim(),
      menuContentInsetLeft: styles.getPropertyValue('--menu-content-inset-left').trim(),
    },
    layout: {
      contentInsetLeft: styles.getPropertyValue('--menu-content-inset-left').trim(),
      pagePaddingLeft: pageStyles?.paddingLeft ?? '',
    },
  }
}

let colorSchemeQuery: MediaQueryList | null = null
const updateColorScheme = () => {
  activeColorScheme.value = colorSchemeQuery?.matches ? 'dark' : 'light'
  void readRenderedStyle()
}

onMounted(() => {
  colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  colorSchemeQuery.addEventListener('change', updateColorScheme)
  updateColorScheme()
})

onUnmounted(() => {
  colorSchemeQuery?.removeEventListener('change', updateColorScheme)
  colorSchemeQuery = null
})

watch(
  () => [detailPending.value, kitchen.value?.style, menu.value?.id],
  () => {
    void readRenderedStyle()
  },
  { deep: true }
)

const pageDebug = computed(() => ({
  ...debug.value,
  style: {
    note: 'Menu colours come from kitchen.style. Light/dark switches with prefers-color-scheme.',
    kitchenStyle: {
      backgroundColorLight: text(kitchenStyle.value.background_color_light),
      backgroundColorDark: text(kitchenStyle.value.background_color_dark),
      fontColorLight: text(kitchenStyle.value.font_color_light),
      fontColorDark: text(kitchenStyle.value.font_color_dark),
      primaryColor: text(kitchenStyle.value.primary_color),
      secondaryColor: text(kitchenStyle.value.secondary_color),
    },
    expected: expectedStyle.value,
    rendered: renderedStyle.value,
    polish: {
      note: 'Local one-kitchen public menu polish. Not shared PageStyle.',
      contentInsetLeft: text(publicMenuPolish.value.content_inset_left),
    },
    currency: {
      code: text(kitchen.value?.currency_code) || 'CHF',
      format: currencyFormat.value,
    },
  },
}))
</script>
