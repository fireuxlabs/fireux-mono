<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Creation queue</h2>
          <p class="text-sm text-dimmed">
            Uploaded menu sources waiting for AI processing and review.
          </p>
        </div>
        <UBadge color="neutral" variant="soft">{{ menuSources.length }}</UBadge>
      </div>
    </template>

    <div v-if="menuSourcesPending" class="text-sm text-dimmed">
      Loading menu sources...
    </div>

    <div v-else-if="menuSources.length" class="grid gap-3 md:grid-cols-2">
      <article
        v-for="source in menuSources"
        :key="source.id"
        class="rounded-lg border border-default bg-default p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="truncate text-sm font-semibold text-highlighted">
                {{ source.id }}
              </h3>
              <UBadge :color="kindColor(sourceKind(source))" variant="soft">
                {{ sourceKind(source) }}
              </UBadge>
              <UBadge :color="statusColor(source.status)" variant="soft">
                {{ source.status }}
              </UBadge>
            </div>
            <p class="mt-1 truncate text-sm text-dimmed">
              {{ sourceFileLabel(source) }}
            </p>
          </div>

          <div class="flex flex-wrap justify-end gap-2">
            <UButton
              size="sm"
              :color="source.status === 'draft' ? 'success' : 'primary'"
              :variant="source.status === 'draft' ? 'solid' : 'soft'"
              :icon="processIcon(source)"
              :to="`/console/kitchen/menus/${encodeURIComponent(source.id)}`"
            >
              {{ processLabel(source) }}
            </UButton>
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-file-search"
              :to="`/console/kitchen/menus/uploads/${encodeURIComponent(source.id)}`"
            >
              Open source
            </UButton>
          </div>
        </div>
      </article>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No sources waiting"
      description="Upload a menu source to start the creation flow."
    />
  </UCard>
</template>

<script setup lang="ts">
import type {
  MenuSourceUploadKind,
  MenuSourceUploadStatus,
} from '../../../../../../menu/models/menu-source-upload.model.ts'
import { useKitchenConsoleMenus } from '../../../../../composables/console/operations/Menus/useKitchenConsoleMenus'

const { menuSources, menuSourcesPending } = useKitchenConsoleMenus()

const text = (value: unknown) => String(value ?? '').trim()
const fileCount = (source: { files_count?: number; files?: unknown[] }) => {
  const count = Number(source.files_count)
  if (Number.isFinite(count) && count > 0) return count
  return Array.isArray(source.files) ? source.files.length : 0
}
const sourceFileLabel = (source: {
  file_name?: string
  files_count?: number
  files?: unknown[]
  source_url?: string
}) => {
  if (text(source.source_url)) return text(source.source_url)

  const count = fileCount(source)
  if (count > 1) return `${count} source files`
  return text(source.file_name) || 'Menu source file'
}

const sourceKind = (source: {
  file_kind?: MenuSourceUploadKind
  source_url?: string
}): MenuSourceUploadKind => {
  if (text(source.source_url)) return 'url'

  const kind = text(source.file_kind) as MenuSourceUploadKind
  return kind || 'document'
}

const processLabel = (source: {
  file_kind?: MenuSourceUploadKind
  status?: MenuSourceUploadStatus
  source_url?: string
}) => {
  // Creation queue language: uploaded means "needs AI"; draft means "needs operator confirm".
  if (source.status === 'draft') return 'Confirm draft'
  return sourceKind(source) === 'url' ? 'Review and process URL' : 'Review and process'
}

const processIcon = (source: {
  status?: MenuSourceUploadStatus
}) => source.status === 'draft' ? 'i-lucide-check-circle-2' : 'i-lucide-scan-text'

const statusColor = (status: MenuSourceUploadStatus) => {
  if (status === 'published') return 'success'
  if (status === 'archived') return 'neutral'
  if (status === 'extracting') return 'info'
  return 'warning'
}

const kindColor = (kind: MenuSourceUploadKind) =>
  kind === 'photo'
    ? 'primary'
    : kind === 'pdf'
      ? 'success'
      : kind === 'url'
        ? 'info'
        : 'neutral'
</script>
