<template>
  <div v-if="section && canWrite" class="menu-editor-actions">
    <FireFormsEditableSimpleField
      v-if="section.status !== 'archived'"
      label="Section name"
      :value="section.label"
      :maxlength="160"
      :capture-intent="capture"
      :update="rename"
    />
    <UButton
      :label="statusAction"
      :color="section.status === 'archived' ? 'neutral' : 'warning'"
      variant="soft"
      @click="open = true"
    />
    <UModal
      v-model:open="open"
      :title="`${statusAction}?`"
      :description="
        section.status === 'archived'
          ? 'Restore the saved section to this Menu.'
          : 'Hide this section from the Menu while keeping its entries.'
      "
      :dismissible="!busy"
    >
      <template #body>
        <p>{{ section.label }}</p>
        <p v-if="error" role="alert">{{ error }}</p>
      </template>
      <template #footer>
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          :disabled="busy"
          @click="open = false"
        />
        <UButton
          :label="statusAction"
          :loading="busy"
          :disabled="busy"
          @click="changeStatus"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMenuEditorScope } from '../../../../../../../menu/composables/useMenuEditorScope'
import { useMenuSection } from '../../../../../../../menu/composables/useMenuSection'
import { useKitchenMenuRecordContext } from '../../../../../../composables/workspace/menu/menus/useKitchenMenuRecordContext'

const { section, sectionId } = useMenuSection()
const { kitchenId, menuId, canWrite, updateSection } =
  useKitchenMenuRecordContext()
const statusAction = computed(() =>
  section.value?.status === 'archived' ? 'Restore section' : 'Archive section'
)
const open = ref(false)
const busy = ref(false)
const error = ref('')
const capture = useMenuEditorScope(
  [kitchenId, menuId, sectionId, canWrite],
  () => {
    open.value = false
    busy.value = false
    error.value = ''
  }
)
function rename(value: string, current = capture()) {
  const label = value.trim()
  if (!label) throw new Error('Enter a section name.')
  return updateSection(
    kitchenId.value,
    menuId.value,
    sectionId.value,
    { label },
    current
  )
}
async function changeStatus() {
  if (!section.value || !canWrite.value || busy.value) return
  const status = section.value.status === 'archived' ? 'active' : 'archived'
  const current = capture()
  busy.value = true
  error.value = ''
  try {
    await updateSection(
      kitchenId.value,
      menuId.value,
      sectionId.value,
      { status },
      current
    )
    if (current()) open.value = false
  } catch (failure) {
    if (current())
      error.value =
        failure instanceof Error
          ? failure.message
          : 'Section could not be updated.'
  } finally {
    if (current()) busy.value = false
  }
}
</script>
