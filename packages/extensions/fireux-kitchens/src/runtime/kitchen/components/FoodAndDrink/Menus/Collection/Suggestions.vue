<template>
  <section
    aria-label="Menu suggestions"
    class="workspace-surface workspace-surface--compact"
  >
    <h2 class="fx-type-card-heading">More Menu ideas</h2>
    <div class="menu-editor-actions">
      <UButton
        v-for="name in suggestions"
        :key="name"
        :label="name"
        :icon="hasPlus ? 'i-lucide-plus' : 'i-lucide-lock-keyhole'"
        color="neutral"
        variant="outline"
        :to="hasPlus ? undefined : '/pricing'"
        :disabled="hasPlus && (!canCreateMenu || busy)"
        @click="hasPlus && create(name)"
      />
    </div>
    <p v-if="!hasPlus" class="fx-type-caption">
      Plus unlocks additional Menus.
    </p>
    <FireCopyError v-if="error" :message="error" />
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenMenusContext } from '../../../../composables/workspace/menus/useKitchenMenusContext'
import { useMenuRecordNavigation } from '../../../../composables/workspace/menus/useMenuRecordNavigation'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
const { menus, subscription, canCreateMenu, createMenu, kitchenId } =
  useKitchenMenusContext()
const { openView } = useMenuRecordNavigation()
const hasPlus = computed(() =>
  ['premium', 'business'].includes(subscription.value)
)
const suggestions = computed(() =>
  ['Breakfast', 'Lunch', 'Specials'].filter(
    (name) =>
      !menus.value.some(
        (menu) => menu.name.toLowerCase() === name.toLowerCase()
      )
  )
)
const busy = ref(false),
  error = ref('')
const captureScope = useMenuEditorScope([kitchenId, subscription], () => {
  busy.value = false
  error.value = ''
})
async function create(name: string) {
  if (!hasPlus.value || !canCreateMenu.value || busy.value) return
  const isCurrent = captureScope()
  busy.value = true
  error.value = ''
  try {
    const menu = await createMenu({ name, format: 'interactive' })
    if (isCurrent()) await openView(menu.slug, 'content')
  } catch (cause) {
    if (isCurrent())
      error.value =
        cause instanceof Error ? cause.message : 'Could not create Menu.'
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
