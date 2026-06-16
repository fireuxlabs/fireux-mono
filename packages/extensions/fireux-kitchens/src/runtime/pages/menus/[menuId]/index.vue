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
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
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
const menuId = String(route.params.menuId || '').trim()
const { data: menu, pending } = await useAsyncData(
  `kitchen-waiting-menu-${menuId}`,
  () =>
    $fetch<WaitingMenu>(`/api/menus/${encodeURIComponent(menuId)}`)
      .catch(() => null)
)
</script>
