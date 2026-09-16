<template>
  <section v-if="menu" class="menu-editor">
    <form class="menu-settings-form" @submit.prevent="save">
      <h2 class="menu-settings-form__title">Menu details</h2>
      <p v-if="!canWrite" class="fx-type-caption">
        You have read-only access to this Menu.
      </p>
      <UFormField label="Name" required>
        <UInput
          v-model="draft.name"
          size="xl"
          :maxlength="120"
          :disabled="!canWrite || saving"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Description">
        <UTextarea
          v-model="draft.description"
          :rows="3"
          :maxlength="500"
          :disabled="!canWrite || saving"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Display order" description="Lower numbers appear first.">
        <UInput v-model.number="draft.sort_order" type="number" step="1" :disabled="!canWrite || saving" />
      </UFormField>
      <UAlert v-if="error" color="error" :title="error"><template #description><MoleculesCopyError :message="error" /></template></UAlert>
      <div v-if="canWrite" class="menu-settings-form__actions">
        <span class="menu-settings-form__state" role="status"><UIcon :name="dirty ? 'i-lucide-circle-dot' : 'i-lucide-check'" />{{ dirty ? 'Unsaved changes' : 'Saved' }}</span>
        <UButton
          v-if="dirty"
          type="submit"
          label="Save changes"
          :loading="saving"
          :disabled="!dirty || !draft.name.trim()"
        />
        <UButton
          v-if="dirty"
          type="button"
          label="Discard changes"
          color="neutral"
          variant="ghost"
          :disabled="!dirty || saving"
          @click="reset"
        />
      </div>
    </form>
  </section>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceMenus } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenus'
const { rawMenus, kitchenId, canWrite, updateMenu, pending, error: readError } = useKitchenWorkspaceMenus()
const menuId = useRouteParam('menuId')
const menu = computed(() => !pending.value && !readError.value
  ? rawMenus.value.find(item => item.id === menuId.value) : undefined)
const values = () => ({ name: menu.value?.name || '', description: menu.value?.description || '', sort_order: menu.value?.sort_order ?? 0 })
const draft = reactive(values())
const saving = ref(false)
const error = ref('')
const toast = useToastify()
const dirty = computed(() => JSON.stringify(draft) !== JSON.stringify(values()))
function reset() { Object.assign(draft, values()); error.value = '' }
watch([kitchenId, menuId], reset)
watch(menu, (next, previous) => {
  if (!previous || (draft.name === previous.name && draft.description === (previous.description || '') && draft.sort_order === previous.sort_order)) reset()
})
async function save() {
  if (saving.value || !canWrite.value || !menu.value || !dirty.value) return
  if (!draft.name.trim() || !Number.isSafeInteger(draft.sort_order)) {
    error.value = 'Enter a name and a whole number for display order.'
    return
  }
  const targetKitchen = kitchenId.value
  const targetMenu = menuId.value
  const patch = { name: draft.name.trim(), description: draft.description.trim(), sort_order: draft.sort_order }
  saving.value = true
  error.value = ''
  try {
    await updateMenu(targetKitchen, targetMenu, patch)
    if (kitchenId.value === targetKitchen && menuId.value === targetMenu) {
      Object.assign(draft, patch)
      toast.add({ title: 'Menu saved', color: 'success' })
    }
  } catch (cause) {
    if (kitchenId.value === targetKitchen && menuId.value === targetMenu)
      error.value = cause instanceof Error ? cause.message : 'Could not save Menu.'
  } finally { saving.value = false }
}
</script>
<style scoped>
.menu-editor { padding: clamp(1.25rem, 3vw, 2rem); min-width: 0; }
.menu-settings-form__title { margin: 0 0 calc(var(--spacing) * 2); font-size: var(--text-lg); font-weight: 600; color: var(--ui-text-highlighted); }

.menu-settings-form {
  display: grid;
  gap: calc(var(--spacing) * 6);
}
.menu-settings-form__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  border-top: 1px solid var(--ui-border);
  padding-top: calc(var(--spacing) * 5);
  min-height: 3.75rem;
}
.menu-settings-form__state { display: inline-flex; align-items: center; gap: calc(var(--spacing) * 2); margin-right: auto; color: var(--ui-text-muted); font-size: var(--text-sm); }
</style>
