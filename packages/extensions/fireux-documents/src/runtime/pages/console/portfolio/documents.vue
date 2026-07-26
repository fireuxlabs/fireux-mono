<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<!-- Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: gate document controls with Portfolio write authority. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-portfolio-documents">
      <template #header>
        <LayoutsConsoleNavbar title="Documents" />
      </template>

      <template #body>
        <section class="space-y-6">
          <UCard>
            <div class="flex items-start gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Document vault</div>
                <div class="text-xs text-dimmed">
                  Mode: <span class="font-medium">{{ runtimeMode }}</span> ·
                  Source:
                  <code>{{ isDemo ? 'demo scenario' : documentsPath }}</code>
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
                Generic file upload. No image-only assumptions.
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
                @click="createLink"
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
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import { computed, ref } from 'vue'
import { usePortfolioDocuments } from '../../../composables/fireux/console/portfolio/operations/Documents/fetch/usePortfolioDocuments'
import { usePortfolioDocumentLinks } from '../../../composables/fireux/console/portfolio/operations/Documents/fetch/usePortfolioDocumentLinks'
import { linkDocumentToEntity } from '../../../composables/fireux/console/portfolio/operations/Documents/mutations/linkDocumentToEntity'
import { useDocumentCreate } from '../../../composables/fireux/console/portfolio/operations/Documents/mutations/useDocumentCreate'
import { useDocumentStorage } from '../../../composables/fireux/console/portfolio/operations/Documents/mutations/useDocumentStorage'
import { documentLinkTargetTypes } from '../../../composables/fireux/console/portfolio/operations/Documents/utils/validation/validateDocumentLinkTarget'
import { useDocumentInterface } from '../../../composables/fireux/console/portfolio/operations/Documents/utils/view/useDocumentInterface'
import { DocumentStorage } from '../../../models/document.model'

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-documents'] },
  nav: {
    key: 'console-portfolio-documents',
    label: 'Documents',
    icon: 'i-lucide-file-text',
    position: 'top',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})

const runtimePortfolio = useActivePortfolio()
const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const isDemo = computed(() => runtimePortfolio.isDemo.value)
const canWrite = computed(() => runtimePortfolio.canWrite.value)
const documentsPath = usePortfolioConsoleChildPath(
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
const linkTargetType = ref('property')
const linkTargetId = ref('')
const linkTargetLabel = ref('')
const linkBusy = ref(false)

const allowedTargetTypesLabel = documentLinkTargetTypes.join(', ')

const { uploadFile } = useDocumentStorage(runtimePortfolio)
const { createDocumentRecord } = useDocumentCreate(runtimePortfolio)
const { linkDocumentToEntity: linkMutation } =
  linkDocumentToEntity(runtimePortfolio)

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0] ?? null
  selectedFile.value = file
}

const uploadSelectedFile = async () => {
  if (!selectedFile.value || !canWrite.value || !runtimeId.value) return

  uploadBusy.value = true
  try {
    const uploaded = await uploadFile({
      file: selectedFile.value,
      pathPrefix: documentsPath.value,
    })

    const uploadedAt = new Date().toISOString().slice(0, 10)
    const documentId = await createDocumentRecord({
      file_name: uploaded.fileName,
      file_type: uploaded.mimeType,
      size_bytes: uploaded.sizeBytes,
      storage_path: uploaded.storagePath,
      download_url: uploaded.downloadUrl,
      uploaded_at: uploadedAt,
      notes: uploadNotes.value,
    })

    linkDocumentId.value = documentId
    uploadNotes.value = ''
    selectedFile.value = null
  } finally {
    uploadBusy.value = false
  }
}

const createLink = async (createTask = false) => {
  if (!canWrite.value) return

  linkBusy.value = true
  try {
    await linkMutation({
      documentId: linkDocumentId.value,
      targetType: linkTargetType.value as any,
      targetId: linkTargetId.value,
      targetLabel: linkTargetLabel.value,
      createTask,
    })

    linkTargetId.value = ''
    linkTargetLabel.value = ''
  } finally {
    linkBusy.value = false
  }
}

const useForLink = (documentId: string) => {
  linkDocumentId.value = documentId
}
</script>
