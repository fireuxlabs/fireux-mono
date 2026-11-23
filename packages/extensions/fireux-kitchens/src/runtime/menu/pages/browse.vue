<template>
  <main
    class="fireux-menu-detail content-start"
    :class="className"
    :style="styleVars"
  >
    <header v-if="menu">
      <p v-if="menu.presentation.kitchenName">
        {{ menu.presentation.kitchenName }}
      </p>
      <h1 class="text-3xl font-bold">{{ menu.content.name }}</h1>
      <p v-if="menu.content.description">{{ menu.content.description }}</p>
    </header>
    <MenuBrowseCatalogue
      v-if="menu"
      :copy="menu.sproochli?.surfaceCopy ?? copy"
      :sections="menu.content.sections"
      :currency-code="menu.presentation.currencyCode"
      :currency-format="menu.presentation.currencyFormat"
      :show-currency="menu.presentation.showCurrency"
      :show-item-images="menu.presentation.showItemImages"
    />
  </main>
</template>

<script setup lang="ts">
import { createError, useFetch, useSeoMeta } from '#imports'
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import MenuBrowseCatalogue from '../components/Browse/Catalogue/Index.vue'
import { useMenuThemeSurface } from '../composables/useMenuThemeSurface'
import type { MenuDetailPayload } from '../models/menu-detail.model'
import { resolveMenuBrowseSurfaceCopy } from '../utils/catalogue/surface-copy'
import '../assets/styles/menu-frame.css'

definePageMeta({ layout: false, key: (route) => route.path })

const kitchenSlug = useRouteParam('slug')
const menuId = useRouteParam('menuId')
const copy = resolveMenuBrowseSurfaceCopy()
const { data, error } = await useFetch<MenuDetailPayload>(
  `/api/menus/${encodeURIComponent(menuId.value)}`,
  { query: { kitchenSlug: kitchenSlug.value } }
)
if (error.value)
  throw createError({
    statusCode: error.value.statusCode || 500,
    statusMessage: error.value.statusMessage || 'Menu unavailable.',
  })
if (data.value?.kind !== 'manifest')
  throw createError({
    statusCode: 404,
    statusMessage: 'Menu not found.',
  })

const menu = computed(() =>
  data.value?.kind === 'manifest' ? data.value.manifest : null
)
const { className, styleVars } = useMenuThemeSurface({
  theme: () => menu.value?.presentation.theme,
  themeSource: () => menu.value?.presentation.themeSource,
  pageCanvas: true,
})
useSeoMeta({
  title: () => menu.value?.content.name,
  description: () => menu.value?.content.description,
})
</script>
