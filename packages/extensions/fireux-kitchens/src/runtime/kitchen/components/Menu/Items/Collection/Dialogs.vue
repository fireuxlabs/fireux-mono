<template>
  <UModal
    :open="Boolean(createKind)"
    title="Add item"
    @update:open="closeCreate"
  >
    <template #body>
      <KitchenMenuItemsCreate
        v-if="createKind"
        :key="createKind"
        :item-kind="createKind"
        @created="createKind = null"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useKitchenItemsContext } from '../../../../composables/workspace/items/useKitchenItemsContext'

const { kitchenId, outcome, readOnly } = useKitchenItemsContext()
const createKind = ref<'food' | 'drink' | null>(null)
const route = useRoute()
const router = useRouter()

function openCreate(kind: 'food' | 'drink') {
  if (!readOnly.value && ['ready', 'empty'].includes(outcome.value))
    createKind.value = kind
}
function closeCreate(open: boolean) {
  if (!open) createKind.value = null
}

watch(kitchenId, () => {
  createKind.value = null
})
watch(
  () => [route.query.create, outcome.value, readOnly.value],
  () => {
    const kind = route.query.create
    if (kind !== 'food' && kind !== 'drink') return
    if (readOnly.value || !['ready', 'empty'].includes(outcome.value)) return
    openCreate(kind)
    void router.replace({ query: { ...route.query, create: undefined } })
  },
  { immediate: true }
)

defineExpose({ openCreate })
</script>
