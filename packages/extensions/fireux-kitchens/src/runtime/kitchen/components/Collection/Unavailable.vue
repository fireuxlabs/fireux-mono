<template>
  <article
    class="fireux-menu-detail kitchen-collection-unavailable"
    data-kitchen-projection="collection-unavailable"
    :data-kitchen-slug="presentation?.kitchenSlug || undefined"
    data-menu-state="unavailable"
    :data-menu-surface-theme="presentation ? 'kitchen' : 'app'"
    :class="themeClassName"
    :style="themeStyleVars"
    aria-labelledby="menu-order-unavailable-title"
  >
    <MenuOrderUnavailable
      :browse-path="presentation ? kitchenPath : ''"
      :failure="failure"
      :kitchen-name="presentation?.kitchenName || ''"
    />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from '#imports'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { MenuLoadFailure } from '../../../menu/composables/useMenu'
import { useMenuThemeSurface } from '../../../menu/composables/useMenuThemeSurface'

type KitchenMenuPresentation = {
  kitchenSlug: string
  kitchenName: string
  pageStyle: Partial<PageStyle>
}

const props = defineProps<{
  kitchenSlug: string
}>()

const kitchenSlug = computed(() => String(props.kitchenSlug || '').trim())
const presentationPath = computed(() =>
  `/api/kitchens/${encodeURIComponent(kitchenSlug.value)}/menu-presentation`
)
const { data: presentation } = await useFetch<KitchenMenuPresentation>(
  presentationPath
)
const kitchenPath = computed(() =>
  `/kitchens/${encodeURIComponent(presentation.value?.kitchenSlug || '')}`
)
const failure: MenuLoadFailure = {
  statusCode: 404,
  title: 'Collection unavailable',
  description: 'This kitchen is not accepting collection orders here right now.',
}
const appPageStyle = {
  background_color_light: 'var(--ui-bg)',
  background_color_dark: 'var(--ui-bg)',
  font_color_light: 'var(--ui-text)',
  font_color_dark: 'var(--ui-text)',
  title_color_light: 'var(--ui-text-highlighted)',
  title_color_dark: 'var(--ui-text-highlighted)',
  primary_color: 'var(--ui-primary)',
  secondary_color: 'var(--ui-text-muted)',
} as const
const surfacePageStyle = computed(() =>
  presentation.value?.pageStyle || appPageStyle
)
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({
  pageStyle: surfacePageStyle,
  colorMode: computed(() => presentation.value ? null : 'light' as const),
  pageCanvas: true,
})
</script>
