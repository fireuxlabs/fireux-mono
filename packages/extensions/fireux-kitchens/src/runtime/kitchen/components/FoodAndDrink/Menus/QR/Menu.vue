<template>
  <UCard>
    <template #header>
      <div class="menu-editor-actions">
        <div class="workspace-surface workspace-surface--compact">
          <h2 class="fx-type-card-heading">
            {{ panel.label }}
          </h2>
          <p v-if="panel.description" class="fx-type-caption">
            {{ panel.description }}
          </p>
          <p class="fx-type-caption">{{ panel.summary }}</p>
        </div>

        <div class="menu-editor-actions">
          <UBadge :color="statusColor(panel.status)" variant="soft">
            {{ panel.status }}
          </UBadge>
          <UBadge v-if="panel.targets.length" color="neutral" variant="soft">
            {{ panel.targets.length }} entr{{
              panel.targets.length === 1 ? 'y' : 'ies'
            }}
          </UBadge>
          <UButton
            :to="panel.editPath"
            color="neutral"
            variant="soft"
            icon="i-lucide-pencil"
          >
            Edit
          </UButton>
        </div>
      </div>
    </template>

    <UAlert
      v-if="!panel.targets.length"
      color="neutral"
      variant="soft"
      title="No guest entries yet"
      description="Publish this menu before creating QR entry points."
    />

    <div v-else class="workspace-surface__grid workspace-surface__grid--2">
      <KitchenFoodAndDrinkMenusQRTarget
        v-for="target in panel.targets"
        :key="target.id"
        :target="target"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { MenuStatus } from '../../../../../menu/models/menu-storage.model.ts'
import type { MenuQrPanel } from '../../../../models/menu-qr-presentation.model'

defineProps<{
  panel: MenuQrPanel
}>()

const statusColor = (status: MenuStatus) =>
  status === 'published'
    ? 'success'
    : status === 'archived'
      ? 'neutral'
      : 'warning'
</script>
