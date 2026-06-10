<template>
  <main class="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
    <KitchenPublicBreadcrumbs
      :kitchen-name="kitchenName"
      :kitchen-slug="kitchenSlug"
      current="menus"
    />

    <UPageHeader
      class="pageheader"
      :title="kitchenName"
      description="Published menus from this kitchen."
    />

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
                {{ menu.name }}
              </h2>
              <p v-if="menu.description" class="text-sm text-dimmed">
                {{ menu.description }}
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
import { useKitchenPublicMenu } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'

const {
  kitchenSlug,
  kitchen,
  menus,
  pending,
  menuLink,
  debug,
} = useKitchenPublicMenu()
const kitchenName = computed(
  () => String(kitchen.value?.display_name || kitchen.value?.name || 'Kitchen menus')
)
const storedKitchenMenuStyleEnabled = computed(
  () => String((kitchen.value as any)?.app_scope_state ?? '').trim() !== 'dedicated_app'
)
const kitchenStyle = computed(() => {
  const style = storedKitchenMenuStyleEnabled.value &&
    kitchen.value &&
    typeof (kitchen.value as any).menu_style === 'object'
    ? (kitchen.value as any).menu_style
    : {}

  return {
    backgroundColorLight: String(style.background_color_light ?? ''),
    backgroundColorDark: String(style.background_color_dark ?? ''),
    fontColorLight: String(style.font_color_light ?? ''),
    fontColorDark: String(style.font_color_dark ?? ''),
    titleColorLight: String(style.title_color_light ?? ''),
    titleColorDark: String(style.title_color_dark ?? ''),
    titleFontSource: String(style.title_font_source ?? ''),
    titleFontFamily: String(style.title_font_family ?? ''),
    fontSource: String(style.font_source ?? ''),
    fontFamily: String(style.font_family ?? ''),
  }
})
const pageDebug = computed(() => ({
  route: debug.value.route,
  rendered: {
    hasKitchen: Boolean(kitchen.value),
    kitchenId: kitchen.value?.id ?? '',
    kitchenName: kitchenName.value,
    kitchenStyle: kitchenStyle.value,
    styleSource: storedKitchenMenuStyleEnabled.value ? 'kitchen.menu_style' : 'tenant-app',
    pending: pending.value,
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
