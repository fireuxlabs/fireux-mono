<template>
  <MenuPublic
    v-if="publicMenu && menuContent.isStructured && !menuContent.pending"
    :kitchen-name="menuOwnerLabel"
    :menu="publicMenu"
    :sections="menuContent.sectionRows"
  >
    <template #breadcrumbs>
      <KitchenPublicBreadcrumbs
        :kitchen-name="menuOwnerLabel"
        :kitchen-slug="kitchenSlug"
        :current="publicMenu.name"
      />
    </template>
  </MenuPublic>

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
  />

  <UPage v-else>
    <UPageBody>
      <p class="text-sm text-dimmed">
        Menu unavailable.
      </p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuContent } from '../../../../../composables/fireux/public/menu/useMenuContent'
import { useMenuFetch } from '../../../../../composables/fireux/public/menu/useMenuFetch'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
})

const route = useRoute()
const menuId = computed(() => String(route.params.menuId || '').trim())
const kitchenSlug = computed(() => String(route.params.slug || '').trim())
const { menu: publicMenu } = useMenuFetch(menuId, { kitchenSlug })
const menuContent = useMenuContent(publicMenu)
const text = (value: unknown) => String(value ?? '').trim()
const sourceUrl = computed(() => text(publicMenu.value?.doc_url))
const menuOwnerLabel = computed(
  () =>
    text(publicMenu.value?.kitchen_name) ||
    text(publicMenu.value?.created_by_label)
)
</script>
