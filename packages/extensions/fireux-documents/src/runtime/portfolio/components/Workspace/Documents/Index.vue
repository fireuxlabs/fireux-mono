<template>
  <section class="workspace-surface workspace-surface--compact">
    <UAlert
      v-if="writeError"
      color="error"
      title="Document action not confirmed"
      :description="writeError"
    >
      <template #actions><FireCopyError :message="writeError" /></template>
    </UAlert>

    <p v-if="outcome === 'pending'" role="status">Loading documents…</p>
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Could not load documents"
    >
      <template #actions
        ><FireCopyError message="Could not load documents."
      /></template>
    </UAlert>
    <p v-else-if="outcome !== 'ready' && outcome !== 'empty'">
      Select an available Portfolio to view documents.
    </p>
    <template v-else>
      <UCard>
        <div class="workspace-surface__grid workspace-surface__grid--2">
          <div class="fx-inset-panel">
            <div>Documents</div>
            <div>{{ documents.length }}</div>
          </div>
          <div class="fx-inset-panel">
            <div>Links</div>
            <div>{{ links.length }}</div>
          </div>
        </div>
      </UCard>

      <UCard v-if="canWrite">
        <template #header>
          <div>Upload document</div>
        </template>

        <div class="space-y-3">
          <input
            type="file"
            class="block w-full rounded border border-default p-2"
            :disabled="!canWrite"
            @change="handleFileInput"
          />

          <UInput
            v-model="uploadNotes"
            :disabled="!canWrite"
            placeholder="Optional notes"
          />

          <UButton
            size="sm"
            icon="i-lucide-upload"
            :disabled="!selectedFile || !canWrite || uploadBusy"
            :loading="uploadBusy"
            @click="uploadSelectedFile"
          >
            Upload to vault
          </UButton>

          <div>
            If interrupted, retry the same file and notes before starting
            another upload.
          </div>
        </div>
      </UCard>

      <UCard v-if="canWrite">
        <template #header>
          <div>Link document to entity</div>
        </template>

        <div class="workspace-surface__grid workspace-surface__grid--2">
          <UInput
            v-model="linkDocumentId"
            :disabled="!canWrite"
            placeholder="Document id"
          />
          <UInput
            v-model="linkTargetType"
            :disabled="!canWrite"
            placeholder="Target type (property, compliance-record, tenancy, ...)"
          />
          <UInput
            v-model="linkTargetId"
            :disabled="!canWrite"
            placeholder="Target id"
          />
          <UInput
            v-model="linkTargetLabel"
            :disabled="!canWrite"
            placeholder="Target label (optional)"
          />
        </div>

        <div class="mt-3 flex items-center gap-2">
          <UButton
            size="sm"
            icon="i-lucide-link"
            :disabled="!canWrite || linkBusy"
            :loading="linkBusy"
            @click="createLink(false)"
          >
            Link document
          </UButton>

          <UButton
            size="sm"
            variant="soft"
            icon="i-lucide-list-checks"
            :disabled="!canWrite || linkBusy"
            @click="createLink(true)"
          >
            Link + create task
          </UButton>
        </div>

        <div class="mt-2">
          Allowed target types: {{ allowedTargetTypesLabel }}
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>Vault documents</div>
        </template>

        <div v-if="cards.length" class="space-y-3">
          <div v-for="item in cards" :key="item.id" class="fx-inset-panel">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <div>{{ item.title }}</div>
                <div>{{ item.subtitle }}</div>
                <div>{{ item.meta }}</div>
                <div>Links: {{ linkCountByDocument[item.id] || 0 }}</div>
              </div>

              <UButton
                size="xs"
                variant="ghost"
                icon="i-lucide-copy"
                @click="useForLink(item.id)"
              >
                Use id
              </UButton>
            </div>
          </div>
        </div>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No documents"
          description="Upload files to populate the vault."
        />
      </UCard>
    </template>
    <FireDiagnosticsDebugPanel
      v-if="isDev"
      title="Portfolio documents"
      object-origin="fetched"
      :objects="{ records: documents }"
      :derived="{ collectionPath: documentsPath, outcome }"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioWorkspace } from '../../../../../../../fireux-properties/src/runtime/portfolio/composables/workspace/usePortfolioWorkspace'

import {
  usePortfolioScope,
  usePortfolioChildPath,
} from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'
import { computed, ref } from 'vue'
import { usePortfolioDocuments } from '../../../composables/documents/usePortfolioDocuments'
import { usePortfolioDocumentLinks } from '../../../composables/documents/usePortfolioDocumentLinks'
import { linkDocumentToEntity } from '../../../utils/documents/linkDocumentToEntity'
import { useDocumentScope } from '../../../composables/useDocumentScope'
import type { DocumentLinkTargetType } from '../../../models/document-link.model'
import { useDocumentStorage } from '../../../composables/documents/useDocumentStorage'
import { documentLinkTargetTypes } from '../../../utils/documents/validateDocumentLinkTarget'
import { useDocumentInterface } from '../../../composables/documents/useDocumentInterface'
import { DocumentStorage } from '../../../models/document.model.ts'

const isDev = import.meta.dev
const runtimePortfolio = usePortfolioScope(usePortfolioWorkspace().id)
const runtimeId = computed(() => runtimePortfolio.id.value)
const canWrite = computed(() => runtimePortfolio.canWrite.value)
const documentsPath = usePortfolioChildPath(
  runtimePortfolio,
  DocumentStorage.collection
)

const { collection: documentCollection, outcome: documentOutcome } =
  usePortfolioDocuments(runtimePortfolio)
const { collection: linkCollection, outcome: linkOutcome } =
  usePortfolioDocumentLinks(runtimePortfolio)
const { pill: documentInterface } = useDocumentInterface()

const outcome = computed(() => {
  if (runtimePortfolio.targetOutcome.value !== 'ready')
    return runtimePortfolio.targetOutcome.value
  if (documentOutcome.value === 'error' || linkOutcome.value === 'error')
    return 'error'
  if (documentOutcome.value === 'pending' || linkOutcome.value === 'pending')
    return 'pending'
  return documentOutcome.value
})
const documents = computed(() =>
  outcome.value === 'ready' ? documentCollection.value : []
)
const links = computed(() =>
  ['ready', 'empty'].includes(outcome.value) ? linkCollection.value : []
)
const cards = computed(() =>
  documents.value
    .map((entry) => documentInterface(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)

const linkCountByDocument = computed(() => {
  const map: Record<string, number> = {}
  for (const link of links.value) {
    const documentId = String(link.document_id || '').trim()
    if (!documentId) continue
    map[documentId] = (map[documentId] || 0) + 1
  }
  return map
})

const selectedFile = ref<File | null>(null)
const uploadNotes = ref('')
const uploadBusy = ref(false)

const linkDocumentId = ref('')
const linkTargetType = ref<DocumentLinkTargetType>('property')
const linkTargetId = ref('')
const linkTargetLabel = ref('')
const linkBusy = ref(false)

const allowedTargetTypesLabel = documentLinkTargetTypes.join(', ')

const { uploadFile } = useDocumentStorage(runtimePortfolio)
const { linkDocumentToEntity: linkMutation } =
  linkDocumentToEntity(runtimePortfolio)

const writeError = ref('')
let uploadAttempt: { file: File; notes: string; requestId: string } | null =
  null
let linkAttempt: { key: string; requestId: string } | null = null
const captureScope = useDocumentScope(runtimePortfolio, () => {
  selectedFile.value = null
  uploadNotes.value = ''
  uploadBusy.value = false
  linkDocumentId.value = ''
  linkTargetId.value = ''
  linkTargetLabel.value = ''
  linkBusy.value = false
  writeError.value = ''
  uploadAttempt = null
  linkAttempt = null
})
const handleFileInput = (event: Event) => {
  selectedFile.value =
    (event.target as HTMLInputElement | null)?.files?.[0] ?? null
}
const uploadSelectedFile = async () => {
  if (
    !selectedFile.value ||
    !canWrite.value ||
    !runtimeId.value ||
    uploadBusy.value
  )
    return
  const file = selectedFile.value,
    notes = uploadNotes.value,
    isCurrent = captureScope()
  if (
    !uploadAttempt ||
    uploadAttempt.file !== file ||
    uploadAttempt.notes !== notes
  )
    uploadAttempt = { file, notes, requestId: crypto.randomUUID() }
  const input = { ...uploadAttempt }
  uploadBusy.value = true
  writeError.value = ''
  try {
    const documentId = await uploadFile(input)
    if (!isCurrent()) return
    linkDocumentId.value = documentId
    if (selectedFile.value === file && uploadNotes.value === notes) {
      uploadNotes.value = ''
      selectedFile.value = null
    }
    uploadAttempt = null
  } catch (error) {
    if (isCurrent())
      writeError.value = `Upload was not confirmed. Retry the same file and notes to reconcile this request. ${error instanceof Error ? error.message : String(error)}`
  } finally {
    if (isCurrent()) uploadBusy.value = false
  }
}
const createLink = async (createTask = false) => {
  if (!canWrite.value || linkBusy.value) return
  const isCurrent = captureScope()
  const draft = {
    documentId: linkDocumentId.value,
    targetType: linkTargetType.value,
    targetId: linkTargetId.value,
    targetLabel: linkTargetLabel.value,
    createTask,
  }
  const key = JSON.stringify(draft)
  if (!linkAttempt || linkAttempt.key !== key)
    linkAttempt = { key, requestId: crypto.randomUUID() }
  linkBusy.value = true
  writeError.value = ''
  try {
    await linkMutation({ ...draft, requestId: linkAttempt.requestId })
    if (!isCurrent()) return
    if (
      linkTargetId.value === draft.targetId &&
      linkTargetLabel.value === draft.targetLabel
    ) {
      linkTargetId.value = ''
      linkTargetLabel.value = ''
    }
    linkAttempt = null
  } catch (error) {
    if (isCurrent())
      writeError.value = `Link was not confirmed. Retry unchanged to reconcile this request. ${error instanceof Error ? error.message : String(error)}`
  } finally {
    if (isCurrent()) linkBusy.value = false
  }
}

const useForLink = (documentId: string) => {
  linkDocumentId.value = documentId
}
</script>
