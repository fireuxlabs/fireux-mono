<template>
  <ClientOnly>
    <div v-if="selectedKitchen" class="space-y-6">
      <UCard variant="subtle">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-plug" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <h2 class="text-2xl font-semibold text-highlighted">
              Plugins
            </h2>
            <p class="text-sm text-dimmed">
              Optional tools for this kitchen.
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-languages" class="size-5 text-muted" />
              <div class="text-base font-semibold text-highlighted">
                Sproochli
              </div>
            </div>
            <p class="text-sm text-dimmed">
              Use Sproochli language tools for this kitchen's public menus.
            </p>
            <p class="text-xs text-muted">
              Kitchen decides if language tools are available. Menu stores the actual language work.
            </p>
          </div>

          <USwitch
            :model-value="sproochliEnabled"
            :disabled="!canWrite || saving"
            unchecked-icon="i-lucide-x"
            checked-icon="i-lucide-check"
            :label="sproochliLabel"
            @update:model-value="updateSproochli"
          />
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="kitchen plugins" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenUpdate } from '../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'

const {
  selectedKitchen,
  kitchenId,
  canWrite,
  sproochliEnabled,
} = useKitchenConsoleIdentity()
const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()
const saving = ref(false)

const sproochliLabel = computed(() =>
  sproochliEnabled.value ? 'Sproochli enabled' : 'Sproochli disabled'
)

async function updateSproochli(value: boolean) {
  if (!canWrite.value || saving.value) return

  const id = String(kitchenId.value || '').trim()
  if (!id) {
    toast.error('Select a kitchen before updating plugins.')
    return
  }

  saving.value = true

  try {
    await updateKitchen(id, { sproochli_enabled: value === true })
    toast.success(value ? 'Sproochli enabled' : 'Sproochli disabled')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update Sproochli: ${message}`)
  } finally {
    saving.value = false
  }
}
</script>
