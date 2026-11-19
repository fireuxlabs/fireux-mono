<template>
  <UModal
    :open="Boolean(createKind)"
    title="Add item"
    @update:open="onOpenChange"
  >
    <template #body>
      <KitchenWorkspaceMenuItemsCreate
        v-if="createKind"
        :key="createKind"
        :item-kind="createKind"
        @created="closeCreate"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useItemCatalogueContext } from '../../../../../composables/workspace/menu/items/useItemCatalogue'

const { createKind, canCreate, openCreate, closeCreate } =
  useItemCatalogueContext()
const route = useRoute()
const router = useRouter()

function onOpenChange(open: boolean) {
  if (!open) closeCreate()
}

watch(
  () => [route.query.create, canCreate.value],
  () => {
    const kind = route.query.create
    if (kind !== 'food' && kind !== 'drink') return
    if (!canCreate.value) return
    openCreate(kind)
    void router.replace({ query: { ...route.query, create: undefined } })
  },
  { immediate: true }
)
</script>
