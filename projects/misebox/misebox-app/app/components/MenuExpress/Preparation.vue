<template>
  <section class="fx-page-stack" aria-label="Menu preparation">
    <UFormField label="Kitchen ID"><UInput v-model="kitchenId" /></UFormField>
    <UButton :loading="loading" @click="loadMenus"
      >Load menus from this Kitchen</UButton
    >
    <UAlert
      v-if="error"
      color="error"
      title="Menus unavailable"
      :description="error"
    />
    <UFormField label="Prepared menu"
      ><USelect v-model="menuId" :items="choices" value-key="id"
    /></UFormField>
    <UButton
      :loading="state.busy"
      :disabled="!kitchenId || !menuId"
      @click="state.act('prepare', { kitchenId, menuId })"
      >Link prepared menu</UButton
    >
    <UButton
      v-if="state.request?.target"
      :to="workspacePath"
      target="_blank"
      variant="outline"
      >Edit menu in Workspace</UButton
    >
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { MenuExpressRequestView } from '../../composables/useMenuExpressRequest'
const props = defineProps<{
  state: Pick<MenuExpressRequestView, 'request' | 'busy' | 'act'>
}>()
const { currentUser } = useAuth()
const { selectedId } = useWorkspace('kitchen')
const kitchenId = ref(''),
  menuId = ref(''),
  choices = ref<Array<{ id: string; label: string; slug: string }>>([])
const loading = ref(false),
  error = ref('')
const captureIntent = useCommandScope([
  kitchenId,
  () => currentUser.value,
  () => props.state.request?.id,
])
watch(
  () => props.state.request?.target,
  (target) => {
    kitchenId.value = target?.kitchenId || selectedId.value || ''
    menuId.value = target?.menuId || ''
  },
  { immediate: true }
)
watch(
  [kitchenId, () => currentUser.value, () => props.state.request?.id],
  () => {
    choices.value = []
    loading.value = false
    error.value = ''
  },
  { flush: 'sync' }
)
const workspacePath = computed(
  () =>
    `/workspace/kitchen/food-and-drink/menus/${encodeURIComponent(props.state.request?.review?.menuSlug || choices.value.find((item) => item.id === menuId.value)?.slug || menuId.value)}?kitchenId=${encodeURIComponent(kitchenId.value)}`
)
async function loadMenus() {
  if (loading.value) return
  const isCurrent = captureIntent(),
    user = currentUser.value,
    kitchen = kitchenId.value
  loading.value = true
  error.value = ''
  try {
    if (!user || user.isAnonymous)
      throw new Error('Sign in as a Misebox operator.')
    const credential = await user.getIdToken()
    if (!isCurrent()) return
    const data = await $fetch<
      Array<{ id: string; label: string; slug: string }>
    >('/api/menu-express/menus', {
      headers: { authorization: `Bearer ${credential}` },
      query: { kitchenId: kitchen },
    })
    if (isCurrent()) choices.value = data
  } catch (cause: any) {
    if (isCurrent()) error.value = cause?.data?.statusMessage || cause.message
  } finally {
    if (isCurrent()) loading.value = false
  }
}
</script>
