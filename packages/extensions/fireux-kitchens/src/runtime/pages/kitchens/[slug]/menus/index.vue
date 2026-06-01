<template>
  <UPage
    class="misebox-menu-index misebox-menu-index--default"
    :style="menuIndexStyle"
  >
    <UPageHeader
      headline="Menus"
      :title="kitchen?.name || 'Kitchen menus'"
    >
      <template #links>
        <UButton
          :to="`/kitchens/${encodeURIComponent(slug)}`"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          size="sm"
        >
          Back to kitchen
        </UButton>
      </template>

      <MenuSproochliLanguageTrigger
        :language-options="languageOptions"
        :selected-language="selectedLanguage"
      />
    </UPageHeader>

    <UPageBody>
      <div v-if="pending" class="text-sm text-dimmed">Loading menus...</div>

      <UAlert
        v-else-if="!kitchen"
        color="neutral"
        variant="soft"
        title="Kitchen unavailable"
        description="This kitchen could not be found."
      />

      <div v-else-if="menus.length" class="grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="menu in menus"
          :key="menu.id"
          :to="menuLink(menu.id)"
          class="block"
        >
          <UCard
            variant="subtle"
            class="misebox-menu-index__card"
          >
            <h2 class="text-lg font-semibold text-highlighted">
              {{ menu.name || menu.id }}
            </h2>
            <p v-if="menu.description" class="mt-1 text-sm text-muted">
              {{ menu.description }}
            </p>
          </UCard>
        </NuxtLink>
      </div>

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="No published menus"
        description="This kitchen has not published a menu yet."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import {
  normalizePublicKitchenLanguage,
  resolvePublicKitchenLanguageOptions,
} from '../../../../composables/fireux/app/public-kitchen-language'
import { useMenuCollection } from '../../../../composables/fireux/firestore/menu/fetch/useMenuCollection'
import { useKitchenCollection } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import MenuSproochliLanguageTrigger from '../../../../components/Menu/SproochliLanguageTrigger.vue'
import { KitchenStorage } from '../../../../models/kitchen.model'
import type { Menu } from '../../../../models/menu.model'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const slug = computed(() => String(route.params.slug || '').trim())
const clean = (value: unknown) => String(value ?? '').trim()
const cleanKey = (value: unknown) => clean(value).toLowerCase()
const queryString = (value: unknown) =>
  Array.isArray(value) ? clean(value[0]) : clean(value)
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const publicConfig = runtimeConfig.public as Record<string, unknown>
const fireuxConfig = asRecord(publicConfig.fireux)
const miseboxConfig = asRecord(fireuxConfig.misebox)
const publicMenuConfig = asRecord(miseboxConfig.publicMenu)
const runtimeSproochli = asRecord(fireuxConfig.sproochli)
const runtimeSproochliEnabled = computed(() => runtimeSproochli.enabled !== false)
const publicMenuSproochliEnabled = computed(() => publicMenuConfig.sproochli !== false)

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const kitchen = computed(
  () =>
    kitchens.value.find(
      (item) => cleanKey((item as any).slug) === cleanKey(slug.value)
    ) ?? null
)
const kitchenId = computed(() => clean(kitchen.value?.id))
const languageSettings = computed(() => asRecord((kitchen.value as any)?.language_settings))
const kitchenSproochliEnabled = computed(() => languageSettings.value.sproochli !== false)
const sproochliEnabled = computed(
  () =>
    runtimeSproochliEnabled.value &&
    publicMenuSproochliEnabled.value &&
    kitchenSproochliEnabled.value
)
const selectedLanguage = computed(() =>
  sproochliEnabled.value
    ? normalizePublicKitchenLanguage(
        queryString(route.query.sproochli)
      )
    : ''
)
const languageOptions = computed(() =>
  sproochliEnabled.value
    ? resolvePublicKitchenLanguageOptions(kitchen.value)
    : []
)
const publicLanguageQuery = computed(() =>
  selectedLanguage.value ? `?sproochli=${encodeURIComponent(selectedLanguage.value)}` : ''
)
const colorRe = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const fontFamilies = {
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}
const menuIndexStyle = computed(() => {
  const style = asRecord((kitchen.value as any)?.public_menu_style)
  const vars: Record<string, string> = {}
  const backgroundColor = clean(style.background_color)
  const surfaceColor = clean(style.surface_color)
  const accentColor = clean(style.accent_color)
  const font = clean(style.font).toLowerCase() as keyof typeof fontFamilies

  if (colorRe.test(backgroundColor)) vars['--misebox-menu-bg'] = backgroundColor
  if (colorRe.test(surfaceColor)) vars['--misebox-menu-card'] = surfaceColor
  if (colorRe.test(accentColor)) vars['--misebox-menu-accent'] = accentColor
  if (fontFamilies[font]) vars['--misebox-menu-font'] = fontFamilies[font]

  return vars
})
const menuRead = useMenuCollection(kitchenId, {
  shape: 'scoped',
  kitchenCollectionPath: KitchenStorage.rootCollection,
})
const menuIsPublicVisible = (menu: Menu) => {
  if ((menu as any).active === false) return false

  const status = clean(menu.status).toLowerCase()
  if (!status) return true
  return !['archived', 'draft', 'inactive', 'private'].includes(status)
}
const menus = computed(() =>
  [...menuRead.menus.value]
    .filter(menuIsPublicVisible)
    .sort(
      (a, b) =>
        Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
        String(a.name || '').localeCompare(String(b.name || ''))
    )
)
const pending = computed(
  () => kitchensPending.value || (Boolean(kitchenId.value) && menuRead.pending.value)
)
const menuLink = (menuId: Menu['id']) =>
  `/kitchens/${encodeURIComponent(slug.value)}/menus/${encodeURIComponent(clean(menuId))}${publicLanguageQuery.value}`
</script>
