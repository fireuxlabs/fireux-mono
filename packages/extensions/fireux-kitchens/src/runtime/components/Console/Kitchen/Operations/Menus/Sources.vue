<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Menu sources</h2>
          <p class="text-sm text-dimmed">
            Uploaded PDFs and photos for this kitchen. Structured menus come after review.
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
              <UBadge :color="kindColor(source.file_kind)" variant="soft">
                {{ source.file_kind || 'document' }}
              </UBadge>
              <UBadge :color="statusColor(source.status)" variant="soft">
                {{ source.status }}
              </UBadge>
            </div>
            <p class="mt-1 truncate text-sm text-dimmed">
              {{ source.file_name || 'Menu source file' }}
            </p>
          </div>

          <UButton
            size="sm"
            variant="soft"
            icon="i-lucide-file-search"
            :to="`/console/kitchen/menus/uploads/${encodeURIComponent(source.id)}`"
          >
            Open
          </UButton>
        </div>
      </article>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No menu sources yet"
      description="Upload a PDF or photo to start the kitchen menu pipeline."
    />
  </UCard>
</template>

<script setup lang="ts">
import type {
  MenuSourceUploadKind,
  MenuSourceUploadStatus,
} from '../../../../../models/menu/menu-source-upload.model'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const { menuSources, menuSourcesPending } = useKitchenConsoleMenus()

const statusColor = (status: MenuSourceUploadStatus) => {
  if (status === 'published') return 'success'
  if (status === 'archived') return 'neutral'
  if (status === 'extracting') return 'info'
  return 'warning'
}

const kindColor = (kind: MenuSourceUploadKind) =>
  kind === 'photo' ? 'primary' : kind === 'pdf' ? 'success' : 'neutral'
</script>
