<template>
  <section
    v-if="menu && menu.schedule !== 'daily' && canManage"
    class="workspace-surface workspace-surface--compact"
  >
    <h2 class="fx-type-card-heading">
      {{ archived ? 'Archived Menu' : 'Archive Menu' }}
    </h2>
    <p class="fx-type-caption">
      {{
        archived
          ? 'Content and service links stay saved. Restore to draft when you need it again.'
          : 'Withdraw this Menu from public views and keep its content for later.'
      }}
    </p>
    <FireCopyError v-if="offeringsError" :message="String(offeringsError)" />
    <p v-else-if="!servicesReady" role="status" class="fx-type-caption">
      Checking services…
    </p>
    <div
      v-else-if="affectedServices.length"
      class="workspace-surface workspace-surface--compact"
    >
      <p class="fx-type-card-heading">Affected services</p>
      <ul class="fx-list-stack">
        <li v-for="service in affectedServices" :key="service.id">
          {{ service.name }}{{ service.enabled ? '' : ' (disabled)' }}
        </li>
      </ul>
      <p class="fx-type-caption">
        These services keep their link, but cannot show this Menu while it is
        archived.
      </p>
    </div>
    <p v-else class="fx-type-caption">No services use this Menu.</p>
    <div class="menu-lifecycle__actions">
      <UButton
        :label="archived ? 'Restore to draft' : 'Archive Menu'"
        :color="archived ? 'neutral' : 'warning'"
        variant="outline"
        :disabled="busy || !servicesReady"
        @click="confirm = 'archive'"
      />
      <UButton
        v-if="canDelete"
        label="Delete permanently"
        color="error"
        variant="ghost"
        :disabled="busy"
        @click="confirm = 'delete'"
      />
    </div>
    <FireCopyError v-if="error" :message="error" />
    <UModal
      :open="Boolean(confirm)"
      :title="
        confirm === 'delete'
          ? `Delete ${menu.name} permanently?`
          : archived
            ? `Restore ${menu.name} to draft?`
            : `Archive ${menu.name}?`
      "
      :description="
        confirm === 'delete'
          ? 'This empty Menu will be permanently removed. This cannot be undone.'
          : archived
            ? 'The Menu will stay unpublished until you publish it again.'
            : 'Its public and QR links will stop showing the Menu. Your content and service links stay saved.'
      "
      @update:open="
        (value) => {
          if (!value && !busy) confirm = ''
        }
      "
    >
      <template #body
        ><div class="menu-lifecycle__confirmation">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="busy"
            @click="confirm = ''"
          />
          <UButton
            :label="
              confirm === 'delete'
                ? 'Delete permanently'
                : archived
                  ? 'Restore to draft'
                  : 'Archive Menu'
            "
            :color="confirm === 'delete' ? 'error' : 'warning'"
            :loading="busy"
            @click="apply"
          /></div
      ></template>
    </UModal>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
const {
  menu,
  menuId,
  menuSlug,
  kitchenId,
  canManage,
  deleteMenu,
  archiveMenu,
  restoreMenu,
  offerings,
  offeringsOutcome,
  offeringsError,
  allSections,
  sectionsPending,
  sectionsError,
} = useKitchenMenuRecordContext()
const confirm = ref<'archive' | 'delete' | ''>(''),
  busy = ref(false),
  error = ref('')
const archived = computed(() => menu.value?.status === 'archived')
const servicesReady = computed(
  () =>
    !offeringsError.value && ['ready', 'empty'].includes(offeringsOutcome.value)
)
const affectedServices = computed(() =>
  offerings.value.filter((service) => service.menu_ids.includes(menuId.value))
)
const canDelete = computed(
  () =>
    servicesReady.value &&
    !affectedServices.value.length &&
    !sectionsPending.value &&
    !sectionsError.value &&
    !allSections.value.length &&
    !Object.values(menu.value?.doc || {}).some(Boolean) &&
    menu.value?.status !== 'published'
)
const captureScope = useMenuEditorScope([kitchenId, menuSlug], () => {
  confirm.value = ''
  busy.value = false
  error.value = ''
})
async function apply() {
  if (
    !canManage.value ||
    !menuId.value ||
    busy.value ||
    !confirm.value ||
    !servicesReady.value
  )
    return
  const action = confirm.value
  if (action === 'delete' && !canDelete.value) return
  const isCurrent = captureScope()
  busy.value = true
  error.value = ''
  try {
    if (action === 'delete') await deleteMenu(kitchenId.value, menuId.value)
    else if (archived.value) await restoreMenu(kitchenId.value, menuId.value)
    else await archiveMenu(kitchenId.value, menuId.value)
    if (!isCurrent()) return
    confirm.value = ''
  } catch (cause) {
    if (isCurrent())
      error.value =
        cause instanceof Error ? cause.message : 'Could not update Menu.'
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>

<style scoped>
.menu-lifecycle__actions,
.menu-lifecycle__confirmation {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
.menu-lifecycle__confirmation {
  justify-content: end;
}
</style>
