<template>
  <section
    v-if="menu"
    class="workspace-surface workspace-surface--compact"
    aria-label="Menu document"
  >
    <UCard v-if="menu.doc">
      <template #header
        ><h2 class="fx-type-card-heading">Current document</h2></template
      >
      <p class="fx-type-caption">{{ menu.doc.name }}</p>
      <MenuDetailDocumentViewer
        v-if="preview.url.value"
        :menu="{
          name: menu.name,
          file: {
            url: preview.url.value,
            name: menu.doc.name,
            type: menu.doc.type,
          },
        }"
        :menu-id="menuId"
        :document-url="preview.url.value"
      />
      <p v-else-if="preview.pending.value" role="status">Opening document…</p>
      <UAlert v-else color="neutral" title="Document preview unavailable">
        <template #description>
          <p>
            {{ preview.error.value || 'This document could not be opened.' }}
          </p>
          <UButton label="Try again" variant="soft" @click="preview.retry" />
        </template>
      </UAlert>
    </UCard>
    <KitchenMenuMenusCreateUpload
      v-if="canWrite"
      document
      :upload-id="menuId"
      replace-existing
      description="Choose one PDF or image. Guests will see this document when the Menu is published."
      :cta-label="menu.doc ? 'Replace document' : 'Upload document'"
    />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { menuDocumentFileIdentity } from '../../../../../menu/utils/records/file-identity'
import {
  menuFileRevision,
  useMenuFilePreview,
} from '../../../../../menu/composables/useMenuFilePreview'
const { menu, menuId, kitchenId, outcome, canWrite } =
  useKitchenMenuRecordContext()
const { currentUser } = useAuth()
const identity = computed(() => menuDocumentFileIdentity(menu.value))
const preview = useMenuFilePreview({
  enabled: () =>
    outcome.value === 'ready' && Boolean(menu.value?.doc && currentUser.value),
  sources: [kitchenId, menuId, identity, outcome],
  async read({ signal, isCurrent }) {
    const destination = { kitchenId: kitchenId.value, menuId: menuId.value }
    const expectedRevision = await menuFileRevision(identity.value)
    if (!isCurrent()) throw new Error('The Menu changed.')
    const token = await currentUser.value!.getIdToken()
    if (!isCurrent()) throw new Error('The Menu changed.')
    return $fetch<Blob>('/api/kitchens/menus/document/file', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...destination, expectedRevision },
      responseType: 'blob',
      signal,
    })
  },
})
</script>
