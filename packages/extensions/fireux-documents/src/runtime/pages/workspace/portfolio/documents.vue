<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Workspace Spine pass: move workspace access metadata to the route and classify its surface. -->
<!-- Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: gate document controls with Portfolio write authority. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-portfolio-documents">
      <template #header>
        <LayoutsWorkspaceNavbar title="Documents" />
      </template>

      <template #body>
        <section class="space-y-6">
          <UAlert v-if="writeError" color="error" title="Document action not confirmed" :description="writeError">
            <template #actions><MoleculesCopyError :error="writeError" /></template>
          </UAlert>
          <UCard>
            <div class="flex items-start gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Document vault</div>
                <div class="text-xs text-dimmed">
                  Source: <span class="font-medium">live</span> ·
                  <code>{{ documentsPath }}</code>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="fx-inset-panel">
                <div class="text-xs text-dimmed">Documents</div>
                <div class="text-xl font-semibold">{{ documents.length }}</div>
              </div>
              <div class="fx-inset-panel">
                <div class="text-xs text-dimmed">Links</div>
                <div class="text-xl font-semibold">{{ links.length }}</div>
              </div>
            </div>
          </UCard>

          <UCard v-if="canWrite">
            <template #header>
              <div class="text-sm font-semibold">Upload document</div>
            </template>

            <div class="space-y-3">
              <input
                type="file"
                class="block w-full rounded border border-default p-2 text-sm"
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

              <div class="text-xs text-dimmed">
                If interrupted, retry the same file and notes before starting another upload.
              </div>
            </div>
          </UCard>

          <UCard v-if="canWrite">
            <template #header>
              <div class="text-sm font-semibold">Link document to entity</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2">
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

            <div class="mt-2 text-xs text-dimmed">
              Allowed target types: {{ allowedTargetTypesLabel }}
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Vault documents</div>
            </template>

            <div v-if="cards.length" class="space-y-3">
              <div
                v-for="item in cards"
                :key="item.id"
                class="fx-inset-panel"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">{{ item.title }}</div>
                    <div class="text-xs text-dimmed">{{ item.subtitle }}</div>
                    <div class="text-xs text-dimmed">{{ item.meta }}</div>
                    <div class="text-xs text-dimmed">
                      Links: {{ linkCountByDocument[item.id] || 0 }}
                    </div>
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
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { computed, ref } from 'vue'
import { usePortfolioDocuments } from '../../../portfolio/composables/documents/usePortfolioDocuments'
import { usePortfolioDocumentLinks } from '../../../portfolio/composables/documents/usePortfolioDocumentLinks'
import { linkDocumentToEntity } from '../../../portfolio/utils/documents/linkDocumentToEntity'
import { useDocumentScope } from '../../../portfolio/composables/useDocumentScope'
import type { DocumentLinkTargetType } from '../../../portfolio/models/document-link.model'
import { useDocumentStorage } from '../../../portfolio/composables/documents/useDocumentStorage'
import { documentLinkTargetTypes } from '../../../portfolio/utils/documents/validateDocumentLinkTarget'
import { useDocumentInterface } from '../../../portfolio/composables/documents/useDocumentInterface'
import { DocumentStorage } from '../../../portfolio/models/document.model.ts'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-documents'] },
  nav: {
    key: 'workspace-portfolio-documents',
    label: 'Documents',
    icon: 'i-lucide-file-text',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})

const runtimePortfolio = useActivePortfolio()
const runtimeId = computed(() => runtimePortfolio.id.value)
const canWrite = computed(() => runtimePortfolio.canWrite.value)
const documentsPath = usePortfolioWorkspaceChildPath(
  runtimePortfolio,
  DocumentStorage.collection
)

const { collection: documentCollection } =
  usePortfolioDocuments(runtimePortfolio)
const { collection: linkCollection } =
  usePortfolioDocumentLinks(runtimePortfolio)
const { pill: documentInterface } = useDocumentInterface()

const documents = computed(() => documentCollection.value)
const links = computed(() => linkCollection.value)
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
let uploadAttempt: { file: File; notes: string; requestId: string } | null = null
let linkAttempt: { key: string; requestId: string } | null = null
const captureScope = useDocumentScope(runtimePortfolio, () => {
  selectedFile.value = null; uploadNotes.value = ''; uploadBusy.value = false
  linkDocumentId.value = ''; linkTargetId.value = ''; linkTargetLabel.value = ''; linkBusy.value = false
  writeError.value = ''; uploadAttempt = null; linkAttempt = null
})
const handleFileInput = (event: Event) => {
  selectedFile.value = (event.target as HTMLInputElement | null)?.files?.[0] ?? null
}
const uploadSelectedFile = async () => {
  if (!selectedFile.value || !canWrite.value || !runtimeId.value || uploadBusy.value) return
  const file = selectedFile.value, notes = uploadNotes.value, isCurrent = captureScope()
  if (!uploadAttempt || uploadAttempt.file !== file || uploadAttempt.notes !== notes) uploadAttempt = { file, notes, requestId: crypto.randomUUID() }
  const input = { ...uploadAttempt }
  uploadBusy.value = true; writeError.value = ''
  try {
    const documentId = await uploadFile(input)
    if (!isCurrent()) return
    linkDocumentId.value = documentId
    if (selectedFile.value === file && uploadNotes.value === notes) { uploadNotes.value = ''; selectedFile.value = null }
    uploadAttempt = null
  } catch (error) {
    if (isCurrent()) writeError.value = `Upload was not confirmed. Retry the same file and notes to reconcile this request. ${error instanceof Error ? error.message : String(error)}`
  } finally { if (isCurrent()) uploadBusy.value = false }
}
const createLink = async (createTask = false) => {
  if (!canWrite.value || linkBusy.value) return
  const isCurrent = captureScope()
  const draft = { documentId: linkDocumentId.value, targetType: linkTargetType.value, targetId: linkTargetId.value, targetLabel: linkTargetLabel.value, createTask }
  const key = JSON.stringify(draft)
  if (!linkAttempt || linkAttempt.key !== key) linkAttempt = { key, requestId: crypto.randomUUID() }
  linkBusy.value = true; writeError.value = ''
  try {
    await linkMutation({ ...draft, requestId: linkAttempt.requestId })
    if (!isCurrent()) return
    if (linkTargetId.value === draft.targetId && linkTargetLabel.value === draft.targetLabel) { linkTargetId.value = ''; linkTargetLabel.value = '' }
    linkAttempt = null
  } catch (error) {
    if (isCurrent()) writeError.value = `Link was not confirmed. Retry unchanged to reconcile this request. ${error instanceof Error ? error.message : String(error)}`
  } finally { if (isCurrent()) linkBusy.value = false }
}

const useForLink = (documentId: string) => {
  linkDocumentId.value = documentId
}
</script>
