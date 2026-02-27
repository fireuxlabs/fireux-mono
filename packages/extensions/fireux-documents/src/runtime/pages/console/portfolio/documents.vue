<template>
  <UDashboardPanel id="console-portfolio-documents">
    <template #header>
      <LayoutsConsoleNavbar title="Documents" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtimeId"
          color="warning"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /portfolios before using the document vault."
          :actions="[{ label: 'Go to portfolios', to: '/portfolios', icon: 'i-lucide-arrow-right' }]"
        />

        <template v-else>
          <UCard>
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Document vault</div>
                <div class="text-xs text-dimmed">
                  Mode: <span class="font-medium">{{ runtimeMode }}</span>
                  · Source: <code>portfolios/{{ runtimeId }}/documents</code>
                </div>
              </div>
              <UButton to="/portfolios" size="sm" variant="soft" icon="i-lucide-repeat">Change selection</UButton>
            </div>
          </UCard>

          <UCard>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Documents</div>
                <div class="text-xl font-semibold">{{ documents.length }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Links</div>
                <div class="text-xl font-semibold">{{ links.length }}</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Upload document</div>
            </template>

            <div class="space-y-3">
              <input
                type="file"
                class="block w-full rounded border border-default p-2 text-sm"
                :disabled="runtimeMode !== 'live'"
                @change="handleFileInput"
              />

              <UInput v-model="uploadNotes" :disabled="runtimeMode !== 'live'" placeholder="Optional notes" />

              <UButton
                size="sm"
                icon="i-lucide-upload"
                :disabled="!selectedFile || runtimeMode !== 'live' || uploadBusy"
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

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Link document to entity</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2">
              <UInput v-model="linkDocumentId" :disabled="runtimeMode !== 'live'" placeholder="Document id" />
              <UInput v-model="linkTargetType" :disabled="runtimeMode !== 'live'" placeholder="Target type (property, compliance-record, tenancy, ...)" />
              <UInput v-model="linkTargetId" :disabled="runtimeMode !== 'live'" placeholder="Target id" />
              <UInput v-model="linkTargetLabel" :disabled="runtimeMode !== 'live'" placeholder="Target label (optional)" />
            </div>

            <div class="mt-3 flex items-center gap-2">
              <UButton
                size="sm"
                icon="i-lucide-link"
                :disabled="runtimeMode !== 'live' || linkBusy"
                :loading="linkBusy"
                @click="createLink"
              >
                Link document
              </UButton>

              <UButton
                size="sm"
                variant="soft"
                icon="i-lucide-list-checks"
                :disabled="runtimeMode !== 'live' || linkBusy"
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
                class="rounded border border-default p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">{{ item.title }}</div>
                    <div class="text-xs text-dimmed">{{ item.subtitle }}</div>
                    <div class="text-xs text-dimmed">{{ item.meta }}</div>
                    <div class="text-xs text-dimmed">Links: {{ linkCountByDocument[item.id] || 0 }}</div>
                  </div>

                  <UButton size="xs" variant="ghost" icon="i-lucide-copy" @click="useForLink(item.id)">
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
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRuntimePortfolio } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { useDocumentCollection } from '../../../composables/fireux/firestore/documents/fetch/useDocumentCollection'
import { useDocumentLinkCollection } from '../../../composables/fireux/firestore/documents/fetch/useDocumentLinkCollection'
import { useDocumentStorage } from '../../../composables/fireux/firestore/documents/mutations/useDocumentStorage'
import { useDocumentCreate } from '../../../composables/fireux/firestore/documents/mutations/useDocumentCreate'
import { linkDocumentToEntity } from '../../../composables/fireux/firestore/documents/mutations/linkDocumentToEntity'
import { useDocumentInterface } from '../../../composables/fireux/firestore/documents/utils/view/useDocumentInterface'
import { documentLinkTargetTypes } from '../../../composables/fireux/firestore/documents/utils/validation/validateDocumentLinkTarget'

definePageMeta({
  layout: 'granite-console',
  nav: {
    key: 'console-portfolio-documents',
    label: 'Documents',
    icon: 'i-lucide-file-text',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['granite-console'],
    group: 'granite',
  },
  requiresAuth: true,
})

const runtimePortfolio = useRuntimePortfolio()
const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeMode = computed(() => runtimePortfolio.mode.value)

const { collection: documentCollection } = useDocumentCollection(runtimePortfolio)
const { collection: linkCollection } = useDocumentLinkCollection(runtimePortfolio)
const { card } = useDocumentInterface()

const documents = computed(() => documentCollection.value)
const links = computed(() => linkCollection.value)
const cards = computed(() =>
  documents.value.map((entry) => card(entry)).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
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

const { uploadFile } = useDocumentStorage()
const { createDocumentRecord } = useDocumentCreate(runtimePortfolio)
const { linkDocumentToEntity: linkMutation } = linkDocumentToEntity(runtimePortfolio)

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0] ?? null
  selectedFile.value = file
}

const uploadSelectedFile = async () => {
  if (!selectedFile.value || runtimeMode.value !== 'live' || !runtimeId.value) return

  uploadBusy.value = true
  try {
    const uploaded = await uploadFile({
      file: selectedFile.value,
      pathPrefix: `portfolios/${runtimeId.value}/documents`,
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
  if (runtimeMode.value !== 'live') return

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
