<template>
  <UPage>
    <UPageBody class="pagebody">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading menu...</p>
      </UPageCard>

      <p v-else-if="!menu" class="text-sm text-dimmed">
        Menu unavailable.
      </p>

      <template v-else>
        <MenuPublicOperatorPanel
          :menu="menu"
          :menu-id="menuId"
        />

        <DevJson
          title="Menu object"
          context="Kitchen waiting menu · /menus/[menuId]"
          parent="Menu detail page"
          :objects="debugObjects"
          :derived="debugDerived"
          :open="true"
        />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed } from 'vue'

type WaitingMenu = {
  id: string
  slug: string
  name: string
  description: string
  doc_url: string
  doc_name: string
  doc_type: string
  kind: string
  doc_storage_path: string
  kitchen_id: string
  created_by: string
}

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicSingleMenuDetailPage',
})

const route = useRoute()
const { uid } = useAuth()
const menuId = String(route.params.menuId || '').trim()
const { data: menu, pending } = await useAsyncData(
  `kitchen-waiting-menu-${menuId}`,
  () =>
    $fetch<WaitingMenu>(`/api/menus/${encodeURIComponent(menuId)}`)
      .catch(() => null)
)
const text = (value: unknown) => String(value ?? '').trim()
const isOwnMenu = computed(() =>
  Boolean(uid.value && text(menu.value?.created_by) === uid.value)
)
const debugObjects = computed(() => ({
  menu: menu.value,
  currentUser: {
    id: uid.value,
  },
}))
const debugDerived = computed(() => ({
  owner: {
    isOwnMenu: isOwnMenu.value,
    createdBy: text(menu.value?.created_by),
    currentUserId: uid.value,
  },
}))
</script>
