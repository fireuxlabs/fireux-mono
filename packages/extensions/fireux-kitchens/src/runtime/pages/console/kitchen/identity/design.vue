<template>
  <UDashboardPanel id="console-kitchen-identity-design">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Design">
        <template #right>
          <UButton
            to="/console/kitchen/identity"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            size="sm"
          >
            Identity
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="console-surface space-y-4">
        <UAlert
          v-if="!selectedKitchen"
          color="neutral"
          variant="soft"
          title="Select a kitchen"
          description="Choose a kitchen before editing its public menu design."
        />

        <UAlert
          v-else-if="!canWrite"
          color="neutral"
          variant="soft"
          title="Read-only kitchen"
          description="You can view this kitchen, but not edit its design."
        />

        <DesignPackEditor
          v-else
          v-model="draft"
          title="Public menu design"
          description="Kitchen-level default for public menu pages. Individual menus can override this later."
          :saving="saving"
          @save="saveDesign"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import type { FireuxDesignColorMode } from 'fireux-core/runtime/composables/fireux/app/design/useFireuxDesignPack'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'
import { useKitchenUpdate } from '../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import {
  KitchenStorage,
  type KitchenDesignPack,
  type KitchenUpdateInput,
} from '../../../../models/kitchen.model'

type DesignDraft = {
  preset?: string
  color_mode?: FireuxDesignColorMode
  style?: Record<string, string>
}

const { selectedKitchen, kitchenId, rootCollection, canWrite } = useKitchenConsoleIdentity()
const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()
const saving = ref(false)
const draft = ref<DesignDraft>({
  preset: 'classic',
  color_mode: 'light',
  style: { font: 'serif', heading_font: 'serif' },
})

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const normalizeDesign = (value: unknown): KitchenDesignPack => {
  const record = asRecord(value)
  const style = asRecord(record.style)

  return {
    preset: String(record.preset || 'classic'),
    color_mode: record.color_mode === 'dark' ? 'dark' : 'light',
    style: {
      font: style.font === 'sans' ? 'sans' : 'serif',
      heading_font: style.heading_font === 'sans' ? 'sans' : 'serif',
    },
  }
}

const kitchenDesign = computed(() =>
  asRecord((selectedKitchen.value as Record<string, unknown> | null)?.design)
)
const publicMenuDesign = computed(() =>
  normalizeDesign(kitchenDesign.value.public_menu)
)

watch(
  publicMenuDesign,
  (next) => {
    draft.value = {
      preset: next.preset,
      color_mode: next.color_mode,
      style: { ...(next.style ?? {}) },
    }
  },
  { immediate: true }
)

async function saveDesign(value: DesignDraft) {
  if (!canWrite.value) return
  if (!kitchenId.value) throw new Error('No kitchen selected.')
  if (rootCollection.value !== KitchenStorage.rootCollection) {
    throw new Error('Kitchen design edits are only available for root kitchens.')
  }

  saving.value = true
  try {
    const design = {
      ...kitchenDesign.value,
      public_menu: normalizeDesign(value),
    } as KitchenUpdateInput['design']

    await updateKitchen(kitchenId.value, { design })
    toast.add({ title: 'Design saved', color: 'success', icon: 'i-lucide-check' })
  } catch (error) {
    toast.add({
      title: 'Could not save design',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    saving.value = false
  }
}

definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-identity-design',
    label: 'Kitchen Design',
    icon: 'i-lucide-palette',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
