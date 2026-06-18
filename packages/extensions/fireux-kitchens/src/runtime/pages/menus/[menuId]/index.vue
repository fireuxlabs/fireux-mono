<template>
  <MenuPublic
    v-if="publicMenu && menuContent.isStructured && !menuContent.pending"
    :kitchen-name="menuOwnerLabel"
    :menu="publicMenu"
    :sections="menuContent.sectionRows"
  />

  <UPage v-else-if="publicMenu && menuContent.isStructured">
    <UPageBody>
      <p class="text-sm text-dimmed">
        Loading menu...
      </p>
    </UPageBody>
  </UPage>

  <MenuSource
    v-else-if="publicMenu"
    :menu="publicMenu"
    :kitchen-name="menuOwnerLabel"
    :source-url="sourceUrl"
  >
    <template #operator>
      <MenuPublicOperatorPanel
        :menu="publicMenu"
        :menu-id="menuId"
      />

      <DevJson
        title="Menu debug"
        context="Public menu · /menus/[menuId]"
        :data="debug"
        :default-open="false"
      />
    </template>
  </MenuSource>

  <UPage v-else>
    <UPageBody>
      <p class="text-sm text-dimmed">
        Menu unavailable.
      </p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { computed } from 'vue'
import { useMenuContent } from '../../../composables/fireux/public/menu/useMenuContent'
import { useMenuFetch } from '../../../composables/fireux/public/menu/useMenuFetch'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicSingleMenuDetailPage',
})

const route = useRoute()
const menuId = computed(() => String(route.params.menuId || '').trim())
const { menu: publicMenu } = useMenuFetch(menuId)
const menuContent = useMenuContent(publicMenu)
const text = (value: unknown) => String(value ?? '').trim()
const sourceUrl = computed(() => text(publicMenu.value?.doc_url))
const menuOwnerLabel = computed(
  () =>
    text(publicMenu.value?.kitchen_name) ||
    text(publicMenu.value?.created_by_label)
)
const debug = computed(() => ({
  object: publicMenu.value,
  derived: {
    menuId: menuId.value,
    sourceUrl: sourceUrl.value,
    ownerLabel: menuOwnerLabel.value,
    isPhoto:
      publicMenu.value?.kind === 'photo' ||
      text(publicMenu.value?.doc_type).startsWith('image/'),
    isPdf:
      publicMenu.value?.kind === 'pdf' ||
      text(publicMenu.value?.doc_type).includes('pdf'),
    isStructured: menuContent.isStructured.value,
    contentCounts: menuContent.counts.value,
    qrPath: publicMenu.value?.qr_path,
    viewTo: publicMenu.value?.view_to,
  },
}))

useSeoMeta({
  title: computed(() => publicMenu.value?.name || 'Menu'),
  description: computed(
    () => publicMenu.value?.description || 'Open this public menu.'
  ),
})
</script>
