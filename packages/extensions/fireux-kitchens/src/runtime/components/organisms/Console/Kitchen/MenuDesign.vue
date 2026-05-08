<template>
  <section class="console-surface space-y-6">
    <UAlert
      v-if="!selectedKitchen"
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before editing its public menu design."
    />

    <UCard v-else>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Menu Design</div>
        </div>
      </template>

      <div class="space-y-5">
        <UAlert
          v-if="!canWrite"
          color="neutral"
          variant="soft"
          title="Menu design is read-only"
          description="Switch to a writable kitchen mode before editing these settings."
        />

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            label="Background colour"
            :error="backgroundError"
          >
            <div class="flex items-center gap-2">
              <input
                type="color"
                class="h-10 w-12 rounded-md border border-default bg-transparent p-1 disabled:opacity-50"
                :value="backgroundPickerValue"
                :disabled="!canWrite"
                aria-label="Menu background colour"
                @input="handleBackgroundPicker"
              >
              <UInput
                v-model="backgroundHex"
                placeholder="#FFF8EF"
                :disabled="!canWrite"
                class="min-w-0 flex-1"
              />
            </div>
          </UFormField>

          <UFormField
            label="Text colour"
            :error="textError"
          >
            <div class="flex items-center gap-2">
              <input
                type="color"
                class="h-10 w-12 rounded-md border border-default bg-transparent p-1 disabled:opacity-50"
                :value="textPickerValue"
                :disabled="!canWrite"
                aria-label="Menu text colour"
                @input="handleTextPicker"
              >
              <UInput
                v-model="textHex"
                placeholder="#1F1A17"
                :disabled="!canWrite"
                class="min-w-0 flex-1"
              />
            </div>
          </UFormField>
        </div>

        <div
          class="rounded-lg border border-default p-4 shadow-sm"
          :style="previewStyle"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
            Public menu preview
          </p>
          <p class="mt-2 text-lg font-semibold">
            {{ kitchenName }}
          </p>
          <p class="mt-1 text-sm opacity-75">
            Menu coming soon
          </p>
        </div>

        <div class="flex justify-end">
          <UButton
            icon="i-lucide-save"
            :loading="saving"
            :disabled="!canSave"
            @click="handleSave"
          >
            Save design
          </UButton>
        </div>
      </div>
    </UCard>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen menu design"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref, watch } from 'vue'
import {
  DEFAULT_MENU_DESIGN,
  expandMenuDesignHex,
  isMenuDesignHex,
  normalizeMenuDesignHex,
} from '../../../../composables/fireux/app/kitchen-menu-design'
import { useKitchenConsoleMenuDesign } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenuDesign'

const {
  selectedKitchen,
  canWrite,
  pending,
  menuDesign,
  saveMenuDesign,
  debug,
} = useKitchenConsoleMenuDesign()
const toast = useToastify()
const isDev = import.meta.dev

const backgroundHex = ref(DEFAULT_MENU_DESIGN.background_hex)
const textHex = ref(DEFAULT_MENU_DESIGN.text_hex)
const saving = ref(false)

watch(
  menuDesign,
  (next) => {
    backgroundHex.value = next.background_hex
    textHex.value = next.text_hex
  },
  { immediate: true }
)

const backgroundError = computed(() =>
  isMenuDesignHex(backgroundHex.value) ? undefined : 'Use #RGB or #RRGGBB.'
)
const textError = computed(() =>
  isMenuDesignHex(textHex.value) ? undefined : 'Use #RGB or #RRGGBB.'
)

const backgroundPickerValue = computed(() =>
  expandMenuDesignHex(backgroundHex.value, DEFAULT_MENU_DESIGN.background_hex)
)
const textPickerValue = computed(() =>
  expandMenuDesignHex(textHex.value, DEFAULT_MENU_DESIGN.text_hex)
)

const previewStyle = computed(() => ({
  backgroundColor: normalizeMenuDesignHex(
    backgroundHex.value,
    DEFAULT_MENU_DESIGN.background_hex
  ),
  color: normalizeMenuDesignHex(textHex.value, DEFAULT_MENU_DESIGN.text_hex),
}))

const kitchenName = computed(() =>
  String(selectedKitchen.value?.name || 'Kitchen')
)

const canSave = computed(
  () =>
    canWrite.value &&
    !saving.value &&
    !pending.value &&
    isMenuDesignHex(backgroundHex.value) &&
    isMenuDesignHex(textHex.value)
)

function pickerValue(event: Event) {
  return String((event.target as HTMLInputElement | null)?.value || '')
}

function handleBackgroundPicker(event: Event) {
  backgroundHex.value = pickerValue(event).toUpperCase()
}

function handleTextPicker(event: Event) {
  textHex.value = pickerValue(event).toUpperCase()
}

async function handleSave() {
  if (!canSave.value) return

  saving.value = true

  try {
    await saveMenuDesign({
      background_hex: normalizeMenuDesignHex(
        backgroundHex.value,
        DEFAULT_MENU_DESIGN.background_hex
      ),
      text_hex: normalizeMenuDesignHex(
        textHex.value,
        DEFAULT_MENU_DESIGN.text_hex
      ),
    })
    toast.add({ title: 'Menu design saved', icon: 'i-heroicons-check-circle' })
  } catch (error) {
    toast.add({
      title: 'Failed to save menu design',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    saving.value = false
  }
}
</script>
