<template>
  <UCard>
    <template #header>
      <div class="menu-editor-actions">
        <div>
          <h2 class="fx-type-card-heading">Source file</h2>
          <p class="fx-type-caption">
            Review the saved source before turning it into a structured menu.
          </p>
        </div>
        <UButton
          v-if="sourceLink"
          :to="sourceLink"
          target="_blank"
          rel="noopener"
          icon="i-lucide-external-link"
          variant="soft"
        >
          Open source
        </UButton>
      </div>
    </template>

    <UAlert
      v-if="sourceLink"
      color="info"
      variant="soft"
      title="Menu URL source"
      description="This source is a live menu or ordering URL. AI processing will read the fetched page content and map visible menu data into a review draft."
    />
    <template v-else>
      <div
        v-if="files.length > 1"
        class="workspace-surface workspace-surface--compact"
      >
        <UButton
          v-for="file in files"
          :key="file.id"
          :aria-pressed="file.id === selectedFile?.id"
          color="neutral"
          :variant="file.id === selectedFile?.id ? 'solid' : 'soft'"
          icon="i-lucide-file"
          class="menu-source-file-link"
          @click="fileChoice = file.id"
        >
          {{ file.file_name || 'Menu source file' }}
        </UButton>
      </div>
      <MenuDetailDocumentViewer
        v-if="preview.url.value && selectedFile"
        :menu="{
          name: selectedFile.file_name,
          fileKind:
            selectedFile.file_kind === 'photo'
              ? 'photo'
              : selectedFile.file_kind === 'pdf'
                ? 'pdf'
                : 'document',
          file: {
            url: preview.url.value,
            name: selectedFile.file_name,
            type: selectedFile.file_type,
          },
        }"
        :menu-id="sourceId"
        :document-url="preview.url.value"
      />
      <p v-else-if="preview.pending.value" role="status">
        Opening source file…
      </p>
      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="Source file unavailable"
      >
        <template v-if="selectedFile && readAvailable" #description>
          <p>{{ preview.error.value || 'This file could not be opened.' }}</p>
          <UButton label="Try again" variant="soft" @click="preview.retry" />
        </template>
      </UAlert>
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { MenuSourceUpload } from '../../../../../../menu/models/menu-source-upload.model'
import {
  menuSourceFileEntries,
  menuSourceFileIdentity,
} from '../../../../../../menu/utils/records/file-identity'
import {
  menuFileRevision,
  useMenuFilePreview,
} from '../../../../../../menu/composables/useMenuFilePreview'
const props = defineProps<{
  kitchenId: string
  sourceId: string
  source: MenuSourceUpload
  readAvailable: boolean
}>()
const { currentUser } = useAuth()
const sourceLink = computed(() => String(props.source.source_url || '').trim())
const files = computed(() => menuSourceFileEntries(props.source))
const fileChoice = ref('')
watch(
  [() => props.kitchenId, () => props.sourceId],
  () => {
    fileChoice.value = ''
  },
  { flush: 'sync' }
)
const selectedFile = computed(
  () =>
    files.value.find((file) => file.id === fileChoice.value) || files.value[0]
)
const identity = computed(() =>
  menuSourceFileIdentity(props.source, selectedFile.value?.id || '')
)
const preview = useMenuFilePreview({
  enabled: () =>
    props.readAvailable &&
    Boolean(
      props.kitchenId &&
        props.sourceId &&
        selectedFile.value &&
        currentUser.value
    ) &&
    !sourceLink.value,
  sources: [
    () => props.kitchenId,
    () => props.sourceId,
    () => selectedFile.value?.id,
    identity,
    () => props.readAvailable,
  ],
  async read({ signal, isCurrent }) {
    const destination = {
      kitchenId: props.kitchenId,
      sourceId: props.sourceId,
      fileId: selectedFile.value!.id,
    }
    const expectedRevision = await menuFileRevision(identity.value)
    if (!isCurrent()) throw new Error('The Menu source changed.')
    const token = await currentUser.value!.getIdToken()
    if (!isCurrent()) throw new Error('The Menu source changed.')
    return $fetch<Blob>('/api/workspace/kitchen/menus/source-file', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { ...destination, expectedRevision },
      responseType: 'blob',
      signal,
    })
  },
})
</script>
