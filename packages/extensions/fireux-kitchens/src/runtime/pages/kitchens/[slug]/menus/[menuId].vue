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
      :kitchen-name="kitchenName"
      :menu="displayMenu"
      :sections="sectionRows"
      :page-style="publicMenuPageStyle"
      :currency-code="kitchen.default_currency_code"
      :currency-format="currencyFormat"
      :show-currency="showCurrency"
      :language-code="selectedLanguage"
    >
      <template v-if="languageOptions.length > 1" #language>
        <SproochliLanguageTrigger
          :language-options="languageOptions"
          :selected-language="selectedLanguage"
          :show-group-labels="showLanguageGroupLabels"
        />
      </template>

      <template #breadcrumbs>
        <KitchenPublicBreadcrumbs
          class="menu-breadcrumbs"
          :kitchen-name="kitchenName"
          :kitchen-slug="kitchenSlug"
          :menu-name="displayMenu.name"
          :selected-language="selectedLanguage"
          current="menu"
        />
      </template>
    </MenuPublic>

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
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
import {
  resolveSproochliLanguageOptions,
  resolveSproochliTranslatedText,
} from 'fireux-sproochli/runtime/sproochli'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import { useKitchenPublicMenuDetail } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../../../models/menu.model'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
})

const {
  detailPending,
  kitchenSlug,
  kitchen,
  menu,
  sectionRows,
  selectedLanguage,
  menuText,
  debug,
} = useKitchenPublicMenuDetail()
const { isAdmin } = useUser()
const isDev = import.meta.dev

const text = (value: unknown) => String(value ?? '').trim()
const kitchenName = computed(() =>
  text(kitchen.value?.display_name || kitchen.value?.name) || 'Kitchen'
)
const languageSettings = computed(() =>
  kitchen.value && typeof (kitchen.value as any).language_settings === 'object'
    ? (kitchen.value as any).language_settings
    : {}
)
const languageOptions = computed(() =>
  resolveSproochliLanguageOptions({
    enabled: (kitchen.value as any)?.sproochli_enabled === true,
    attachedLanguages: (languageSettings.value as any)?.attached_languages,
    cachedLanguages: (languageSettings.value as any)?.cache_languages,
    publicLanguages: (languageSettings.value as any)?.public_languages,
  })
)
const showLanguageGroupLabels = computed(() => isAdmin.value === true)
const displayMenu = computed<Menu>(() => {
  const current = menu.value as Menu | null
  if (!current) return {} as Menu

  return {
    ...current,
    name:
      resolveSproochliTranslatedText({
        defaultText: current.name,
        translations: (current as any)?.names ?? (current as any)?.translations,
        selectedLanguage: selectedLanguage.value,
        cacheText: menuText(`menu:${text(current.id)}:name`),
      }).text || current.name,
    description:
      resolveSproochliTranslatedText({
        defaultText: current.description,
        translations: (current as any)?.descriptions,
        selectedLanguage: selectedLanguage.value,
        cacheText: menuText(`menu:${text(current.id)}:description`),
      }).text || current.description,
  }
})
const currencyFormat = computed(
  () => (text(kitchen.value?.menu_currency_format) || 'dash') as CurrencyDisplayFormat
)
const showCurrency = computed(() => kitchen.value?.menu_show_currency !== false)
const storedKitchenMenuStyleEnabled = computed(
  () => text((kitchen.value as any)?.app_scope_state) !== 'dedicated_app'
)
const kitchenStyle = computed<Partial<PageStyle>>(() => {
  if (!storedKitchenMenuStyleEnabled.value) return {}

  const style = kitchen.value?.menu_style
  return style && typeof style === 'object' ? style : {}
})
const publicMenuPageStyle = computed(() => kitchenStyle.value)

const pageDebug = computed(() => ({
  ...debug.value,
  style: {
    note: 'Parent-app kitchens may use kitchen.menu_style. Dedicated tenant apps use their app/runtime styling.',
    source: storedKitchenMenuStyleEnabled.value ? 'kitchen.menu_style' : 'tenant-app',
    storedKitchenMenuStyleEnabled: storedKitchenMenuStyleEnabled.value,
    kitchenStyle: {
      backgroundColorLight: text(kitchenStyle.value.background_color_light),
      backgroundColorDark: text(kitchenStyle.value.background_color_dark),
      fontColorLight: text(kitchenStyle.value.font_color_light),
      fontColorDark: text(kitchenStyle.value.font_color_dark),
      titleColorLight: text(kitchenStyle.value.title_color_light),
      titleColorDark: text(kitchenStyle.value.title_color_dark),
      titleFontSource: text(kitchenStyle.value.title_font_source),
      titleFontFamily: text(kitchenStyle.value.title_font_family),
      fontSource: text(kitchenStyle.value.font_source),
      fontFamily: text(kitchenStyle.value.font_family),
    },
    currency: {
      code: text(kitchen.value?.default_currency_code) || 'CHF',
      format: currencyFormat.value,
      show: showCurrency.value,
    },
    sproochli: {
      enabled: (kitchen.value as any)?.sproochli_enabled === true,
      selectedLanguage: selectedLanguage.value || null,
      languageOptions: languageOptions.value.map((option) => option.code || 'original'),
    },
  },
}))
</script>
