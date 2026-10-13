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
    <UAlert title="Kitchen unavailable" description="This Kitchen is not available." color="neutral" />
  </article>
</template>

<script setup lang="ts">
import { useLiveFetch } from 'fireux-core/runtime/composables/fireux/firestore/useLiveFetch'
import { computed } from 'vue'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { MenuLoadFailure } from '../../../menu/composables/useMenu'
import { useMenuThemeSurface } from '../../../menu/composables/useMenuThemeSurface'

type KitchenMenuPresentation = {
  kitchenSlug: string
  kitchenName: string
  theme?: WorkspaceTheme
}

const props = defineProps<{
  kitchenSlug: string
}>()

const kitchenSlug = computed(() => String(props.kitchenSlug || '').trim())
const presentationPath = computed(
  () =>
    `/api/kitchens/${encodeURIComponent(kitchenSlug.value)}/menu-presentation`
)
const { data: presentation } =
  await useLiveFetch<KitchenMenuPresentation>(presentationPath)
const kitchenPath = computed(
  () => `/kitchens/${encodeURIComponent(presentation.value?.kitchenSlug || '')}`
)
const failure: MenuLoadFailure = {
  statusCode: 404,
  title: 'Collection unavailable',
  description:
    'This kitchen is not accepting collection orders here right now.',
}
const { className: themeClassName, styleVars: themeStyleVars } =
  useMenuThemeSurface({
    theme: computed(() => presentation.value?.theme),
    pageCanvas: true,
  })
</script>
