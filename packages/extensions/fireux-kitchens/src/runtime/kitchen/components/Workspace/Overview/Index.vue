<template>
  <section class="workspace-surface">
    <UAlert
      v-if="!kitchenId"
      color="neutral"
      variant="soft"
      icon="i-lucide-store"
      title="No kitchen selected"
      description="Select or create a kitchen before using the operations overview."
    />

    <UAlert
      v-else-if="!selectedKitchen && targetOutcome === 'error'"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Kitchen unavailable"
      description="The selected kitchen could not be loaded."
    />

    <UAlert
      v-else-if="!selectedKitchen && targetOutcome === 'empty'"
      color="warning"
      variant="soft"
      icon="i-lucide-store"
      title="Kitchen unavailable"
      description="The selected kitchen is not available in this App."
    />

    <UAlert
      v-else-if="!selectedKitchen"
      color="neutral"
      variant="soft"
      icon="i-lucide-loader-circle"
      title="Loading kitchen"
      description="Restoring the selected kitchen."
    />

    <div v-else class="space-y-4">
      <UCard>
        <div
          class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
        >
          <div class="min-w-0 space-y-4">
            <div class="flex items-start gap-3">
              <UAvatar
                :src="identityImage || undefined"
                :alt="kitchenTitle"
                :text="imageInitials"
                size="lg"
              />
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-xl font-semibold text-highlighted">
                    {{ kitchenTitle }}
                  </h2>
                  <UBadge :color="visibilityBadgeColor" variant="soft">
                    {{ visibilityBadgeLabel }}
                  </UBadge>
                </div>
                <p v-if="kitchenSubtitle" class="mt-1 text-sm text-dimmed">
                  {{ kitchenSubtitle }}
                </p>
              </div>
            </div>

            <div v-if="kitchenPill" class="max-w-sm">
              <KitchenCardsPill
                v-bind="kitchenPill"
                :link="false"
                :show-badges="false"
              />
            </div>
          </div>

          <div class="grid min-w-0 gap-2 sm:grid-cols-2 lg:min-w-80">
            <div
              v-for="item in detailItems"
              :key="item.key"
              class="rounded-lg border border-default px-3 py-2"
            >
              <div
                class="flex items-center gap-2 text-xs font-medium text-dimmed"
              >
                <UIcon :name="item.icon" class="size-3.5" />
                <span>{{ item.label }}</span>
              </div>
              <div class="mt-1 truncate text-sm text-highlighted">
                {{ item.value }}
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 xl:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1fr)]">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-highlighted">
                  Core identity
                </div>
              </div>
              <div class="text-2xl font-semibold text-highlighted">
                {{ identityPercent }}%
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <div class="h-2 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-primary"
                :style="{ width: `${identityPercent}%` }"
              />
            </div>

            <div
              v-if="missingIdentityFields.length"
              class="flex flex-wrap gap-2"
            >
              <UButton
                v-for="field in missingIdentityFields"
                :key="field.key"
                :to="readOnly ? undefined : field.to"
                :disabled="readOnly"
                color="neutral"
                variant="soft"
                size="xs"
              >
                {{ field.label }}
              </UButton>
            </div>

            <div v-else class="flex flex-wrap gap-2">
              <UBadge color="success" variant="soft"> Ready </UBadge>
            </div>

            <div class="grid gap-2">
              <div
                v-for="field in priorityIdentityFields"
                :key="field.key"
                class="flex items-center justify-between gap-3 text-sm"
              >
                <span class="text-toned">{{ field.label }}</span>
                <div class="flex items-center gap-2">
                  <UBadge
                    :color="field.complete ? 'success' : 'neutral'"
                    variant="soft"
                    size="xs"
                  >
                    {{ field.complete ? 'Ready' : 'Missing' }}
                  </UBadge>
                  <UButton
                    v-if="!field.complete && field.to"
                    :to="readOnly ? undefined : field.to"
                    :disabled="readOnly"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-arrow-right"
                    aria-label="Fix field"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <UCard
            v-for="card in operationCards"
            :key="card.key"
            :ui="{ body: 'space-y-3' }"
          >
            <div class="flex items-start gap-3">
              <div class="min-w-0">
                <div
                  class="flex items-center gap-2 text-sm font-semibold text-highlighted"
                >
                  <UIcon :name="card.icon" class="size-4 text-dimmed" />
                  <span>{{ card.label }}</span>
                </div>
                <p class="mt-1 text-xs text-dimmed">
                  {{ card.detail }}
                </p>
              </div>
            </div>

            <UButton size="xs" color="neutral" variant="soft" :to="card.to">
              Open
            </UButton>
          </UCard>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <DevDebugPanel
        title="Kitchen overview"
        scope="workspace"
        object-origin="fetched"
        :objects="{ selectedKitchen }"
        :derived="pageDebug"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceOverview } from '../../../composables/workspace/overview/useKitchenWorkspaceOverview'

const {
  selectedKitchen,
  kitchenId,
  targetOutcome,
  kitchenTitle,
  kitchenSubtitle,
  identityImage,
  imageInitials,
  kitchenPill,
  detailItems,
  visibilityBadgeLabel,
  visibilityBadgeColor,
  identityPercent,
  readOnly,
  missingIdentityFields,
  priorityIdentityFields,
  operationCards,
  debug,
} = useKitchenWorkspaceOverview()
const pageDebug = debug
</script>
