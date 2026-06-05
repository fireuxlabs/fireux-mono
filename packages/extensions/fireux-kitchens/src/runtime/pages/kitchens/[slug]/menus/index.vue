<template>
  <main class="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
    <UButton
      :to="`/kitchens/${encodeURIComponent(kitchenSlug)}`"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to kitchen
    </UButton>

    <UPageHeader
      class="pageheader"
      :title="kitchenName"
      description="Published menus from this kitchen."
    >
      <template #links>
        <SproochliLanguageTrigger
          v-if="sproochliEnabled"
          :language-options="languageOptions"
          :selected-language="selectedLanguage"
          :show-group-labels="showLanguageGroupLabels"
        />
      </template>
    </UPageHeader>

    <div class="space-y-3">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading menus...</p>
      </UPageCard>

      <UAlert
        v-if="!pending && !kitchen"
        color="neutral"
        variant="soft"
        title="Kitchen unavailable"
        description="This kitchen could not be found."
      />

      <template v-if="!pending && kitchen && menus.length">
        <UPageCard
          v-for="menu in menus"
          :key="menu.id"
          variant="subtle"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 space-y-1">
              <h2 class="text-lg font-semibold text-highlighted">
                {{ localizedMenuName(menu) }}
              </h2>
              <p v-if="localizedMenuDescription(menu)" class="text-sm text-dimmed">
                {{ localizedMenuDescription(menu) }}
              </p>
            </div>

            <UButton
              :to="menuLink(menu.id)"
              icon="i-lucide-arrow-right"
              trailing
            >
              Open
            </UButton>
          </div>
        </UPageCard>
      </template>

      <UAlert
        v-if="!pending && kitchen && !menus.length"
        color="neutral"
        variant="soft"
        title="No published menus"
        description="This kitchen has not published a menu yet."
      />
    </div>

    <DevJson
      v-if="isDev"
      title="Kitchen public menu debug"
      context="Kitchen menu index · /kitchens/[slug]/menus"
      :data="pageDebug"
      :default-open="true"
      :hide-when-empty="false"
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import {
  resolveSproochliLanguageOptions,
  resolveSproochliTranslatedText,
} from 'fireux-sproochli/runtime/composables/fireux/sproochli/publicLanguage'
import { useKitchenPublicMenu } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../../../models/menu.model'

const {
  kitchenSlug,
  kitchen,
  menus,
  selectedLanguage,
  pending,
  menuLink,
  debug,
} = useKitchenPublicMenu()
const { isAdmin } = useUser()
const isDev = import.meta.dev
const kitchenName = computed(
  () => String(kitchen.value?.display_name || kitchen.value?.name || 'Kitchen menus')
)
const sproochliEnabled = computed(
  () => (kitchen.value as any)?.sproochli_enabled === true
)
const languageSettings = computed(() =>
  kitchen.value && typeof (kitchen.value as any).language_settings === 'object'
    ? (kitchen.value as any).language_settings
    : {}
)
const languageOptions = computed(() =>
  resolveSproochliLanguageOptions({
    enabled: sproochliEnabled.value,
    defaultLanguage: (languageSettings.value as any)?.default_language,
    attachedLanguages: (languageSettings.value as any)?.attached_languages,
    cachedLanguages: (languageSettings.value as any)?.cache_languages,
    publicLanguages: (languageSettings.value as any)?.public_languages,
  })
)
const showLanguageGroupLabels = computed(() => isAdmin.value === true)
const localizedMenuName = (menu: Menu) =>
  resolveSproochliTranslatedText({
    defaultText: menu.name,
    translations: (menu as any)?.names ?? (menu as any)?.translations,
    selectedLanguage: selectedLanguage.value,
  }).text || String(menu.name || '').trim()
const localizedMenuDescription = (menu: Menu) =>
  resolveSproochliTranslatedText({
    defaultText: menu.description,
    translations: (menu as any)?.descriptions,
    selectedLanguage: selectedLanguage.value,
  }).text || String(menu.description || '').trim()
const kitchenStyle = computed(() => {
  const style = kitchen.value && typeof (kitchen.value as any).menu_style === 'object'
    ? (kitchen.value as any).menu_style
    : {}

  return {
    backgroundColorLight: String(style.background_color_light ?? ''),
    backgroundColorDark: String(style.background_color_dark ?? ''),
    fontColorLight: String(style.font_color_light ?? ''),
    fontColorDark: String(style.font_color_dark ?? ''),
    primaryColor: String(style.primary_color ?? ''),
    secondaryColor: String(style.secondary_color ?? ''),
  }
})
const pageDebug = computed(() => ({
  route: debug.value.route,
  rendered: {
    hasKitchen: Boolean(kitchen.value),
    kitchenId: kitchen.value?.id ?? '',
    kitchenName: kitchenName.value,
    kitchenStyle: kitchenStyle.value,
    pending: pending.value,
    selectedLanguage: selectedLanguage.value || null,
    sproochliEnabled: sproochliEnabled.value,
    menusCount: menus.value.length,
    menuLinks: menus.value.map((menu) => ({
      id: menu.id,
      name: menu.name,
      status: menu.status,
      to: menuLink(menu.id),
    })),
  },
  source: {
    kitchenLookup: debug.value.kitchenLookup,
    menuLookup: debug.value.menuLookup,
    pending: debug.value.pending,
  },
}))
</script>
