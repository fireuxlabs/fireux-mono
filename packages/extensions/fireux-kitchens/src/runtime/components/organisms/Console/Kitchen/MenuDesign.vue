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

        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="option in colorModeOptions"
            :key="option.value"
            type="button"
            class="rounded-lg border p-4 text-left transition"
            :class="modeButtonClass(option.value)"
            :disabled="!canWrite"
            :aria-pressed="colorMode === option.value"
            @click="selectColorMode(option.value)"
          >
            <span class="text-sm font-semibold">{{ option.label }}</span>
            <span class="mt-1 block text-sm text-muted">{{ option.description }}</span>
          </button>
        </div>

        <div
          class="menu-design-preview rounded-lg border p-4 shadow-sm"
          :class="previewClass"
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
import { useKitchenConsoleMenuDesign } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenuDesign'
import type { PublicMenuColorMode } from '../../../../composables/fireux/app/public-menu-design'

const {
  selectedKitchen,
  canWrite,
  pending,
  publicMenuDesign,
  savePublicMenuDesign,
  debug,
} = useKitchenConsoleMenuDesign()
const toast = useToastify()
const isDev = import.meta.dev

const colorModeOptions: Array<{
  value: PublicMenuColorMode
  label: string
  description: string
}> = [
  {
    value: 'light',
    label: 'Light menu',
    description: 'White paper, dark text. Good for Luna Piccante.',
  },
  {
    value: 'dark',
    label: 'Dark menu',
    description: 'Black paper, light text. Good for La Tapberne.',
  },
]

const colorMode = ref<PublicMenuColorMode>('light')
const saving = ref(false)

watch(
  publicMenuDesign,
  (next) => {
    colorMode.value = next.color_mode
  },
  { immediate: true }
)

const previewClass = computed(() => `menu-design-preview--${colorMode.value}`)

const kitchenName = computed(() =>
  String(selectedKitchen.value?.name || 'Kitchen')
)

const canSave = computed(
  () =>
    canWrite.value &&
    !saving.value &&
    !pending.value &&
    colorMode.value !== publicMenuDesign.value.color_mode
)

function selectColorMode(nextMode: PublicMenuColorMode) {
  if (!canWrite.value) return
  colorMode.value = nextMode
}

function modeButtonClass(mode: PublicMenuColorMode) {
  return [
    colorMode.value === mode
      ? 'border-primary bg-primary/10 text-primary'
      : 'border-default bg-default text-highlighted hover:bg-elevated',
    !canWrite.value ? 'cursor-not-allowed opacity-60' : '',
  ]
}

async function handleSave() {
  if (!canSave.value) return

  saving.value = true

  try {
    await savePublicMenuDesign({ color_mode: colorMode.value })
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

<style scoped>
.menu-design-preview--light {
  background: #fffaf2;
  border-color: rgba(34, 25, 20, 0.16);
  color: #211915;
}

.menu-design-preview--dark {
  background: #090806;
  border-color: rgba(255, 255, 255, 0.18);
  color: #fff7e8;
}
</style>
