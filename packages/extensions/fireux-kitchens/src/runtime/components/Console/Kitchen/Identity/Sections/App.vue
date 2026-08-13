<template>
  <MoleculesStateCard
    v-if="pending"
    entity="App identity"
    kind="document"
    surface="bare"
    loading
  />

  <UAlert
    v-else-if="errorMessage"
    color="error"
    variant="soft"
    title="Unable to load App identity"
    :description="errorMessage"
  />

  <div v-else-if="state" class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <UBadge color="primary" variant="soft" icon="i-lucide-sparkles">App</UBadge>
      <code class="text-xs text-dimmed">{{ state.app_id }}</code>
    </div>

    <UCard variant="subtle">
      <template #header>
        <div>
          <div class="font-semibold text-highlighted">Five App masters</div>
          <p class="text-sm text-dimmed">
            The universal asset gate established during App onboarding.
          </p>
        </div>
      </template>
      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div
          v-for="asset in assets"
          :key="asset.key"
          class="rounded-md border border-default p-3"
        >
          <p class="text-sm font-medium text-highlighted">{{ asset.label }}</p>
          <UBadge
            class="mt-2"
            :color="asset.present ? 'success' : 'warning'"
            variant="soft"
          >
            {{ asset.present ? 'Present' : 'Missing' }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <div class="font-semibold text-highlighted">App palette</div>
          <p class="text-sm text-dimmed">
            Eight effective roles. Saving stores only additions and overrides above Console.
          </p>
        </div>
      </template>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UFormField v-for="field in paletteFields" :key="field.key" :label="field.label">
          <div class="flex items-center gap-2">
            <input
              v-if="validHex(draftPalette[field.key])"
              class="size-9 rounded-md border border-default bg-default"
              type="color"
              :value="draftPalette[field.key]"
              :disabled="!state.can_write"
              @input="draftPalette[field.key] = ($event.target as HTMLInputElement).value"
            >
            <span v-else class="size-9 rounded-md border border-dashed border-default" />
            <UInput
              v-model="draftPalette[field.key]"
              :disabled="!state.can_write"
              placeholder="#000000"
            />
          </div>
        </UFormField>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <div class="font-semibold text-highlighted">App typography</div>
          <p class="text-sm text-dimmed">
            Two families; templates derive their semantic roles.
          </p>
        </div>
      </template>
      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Display family">
          <UInput v-model="draftTypography.display_family" :disabled="!state.can_write" />
        </UFormField>
        <UFormField label="Body family">
          <UInput v-model="draftTypography.body_family" :disabled="!state.can_write" />
        </UFormField>
      </div>
    </UCard>

    <UAlert
      v-if="!state.can_write"
      color="neutral"
      variant="soft"
      title="App settings are read-only"
      description="Dedicated App admin access is required because these values affect every Kitchen attached to the App."
    />

    <div v-else class="flex items-center justify-between gap-3">
      <p class="text-xs text-dimmed">{{ saveState }}</p>
      <UButton :disabled="!valid" :loading="saving" @click="save">
        Save App identity
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import type {
  AppPalette,
  AppPaletteLayer,
  AppTypography,
  ConsolePalette,
} from 'fireux-core/types/theme'
import { computed, reactive, ref, watch } from 'vue'

type AppThemeState = {
  ok: true
  kitchen_id: string
  app_id: string
  can_write: boolean
  console_palette: ConsolePalette | null
  app_palette: AppPaletteLayer | null
  effective_palette: AppPalette | null
  typography: AppTypography | null
  media: Record<'logo_url' | 'wordmark_light_url' | 'wordmark_dark_url' | 'cover_url' | 'thumbnail_url', string>
}

const props = defineProps<{ kitchenId: string }>()
const emit = defineEmits<{ saved: [] }>()
const toast = useToastify()
const state = ref<AppThemeState | null>(null)
const pending = ref(false)
const saving = ref(false)
const saveState = ref('')
const errorMessage = ref('')

const paletteFields = [
  { key: 'canvas', label: 'Canvas' },
  { key: 'surface', label: 'Surface' },
  { key: 'canvas_inverted', label: 'Canvas inverted' },
  { key: 'text', label: 'Text' },
  { key: 'text_muted', label: 'Text muted' },
  { key: 'ink', label: 'Ink' },
  { key: 'accent', label: 'Accent' },
  { key: 'accent_contrast', label: 'Accent contrast' },
] as const

const draftPalette = reactive<AppPalette>(Object.fromEntries(
  paletteFields.map(field => [field.key, ''])
) as AppPalette)
const draftTypography = reactive<AppTypography>({
  display_family: '',
  body_family: '',
})

const validHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value)
const valid = computed(() =>
  paletteFields.every(field => validHex(draftPalette[field.key])) &&
  Boolean(draftTypography.display_family.trim()) &&
  Boolean(draftTypography.body_family.trim())
)

const assets = computed(() => {
  const media = state.value?.media
  return [
    { key: 'logo_url', label: 'Logo' },
    { key: 'wordmark_light_url', label: 'Wordmark · light' },
    { key: 'wordmark_dark_url', label: 'Wordmark · dark' },
    { key: 'cover_url', label: 'Cover' },
    { key: 'thumbnail_url', label: 'Thumbnail' },
  ].map(asset => ({
    ...asset,
    present: Boolean(media?.[asset.key as keyof AppThemeState['media']]),
  }))
})

function apply(next: AppThemeState) {
  state.value = next
  const palette = next.effective_palette || {
    ...next.console_palette,
    ...next.app_palette,
  }
  for (const field of paletteFields) {
    draftPalette[field.key] = String(palette?.[field.key] || '')
  }
  draftTypography.display_family = next.typography?.display_family || ''
  draftTypography.body_family = next.typography?.body_family || ''
}

async function load() {
  if (!props.kitchenId) return
  pending.value = true
  errorMessage.value = ''
  try {
    const user = await useRequireUser()
    const response = await $fetch<AppThemeState>('/api/console/kitchen/app-theme', {
      query: { kitchen_id: props.kitchenId },
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
    })
    apply(response)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Please try again.'
  } finally {
    pending.value = false
  }
}

async function save() {
  if (!valid.value || !state.value?.can_write || saving.value) return
  saving.value = true
  saveState.value = 'Saving...'
  try {
    const user = await useRequireUser()
    await $fetch('/api/console/kitchen/app-theme', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: {
        kitchen_id: props.kitchenId,
        palette: { ...draftPalette },
        typography: { ...draftTypography },
      },
    })
    await load()
    saveState.value = 'Saved'
    emit('saved')
  } catch (error) {
    saveState.value = 'Save failed'
    toast.error(error instanceof Error ? error.message : 'Please try again.')
  } finally {
    saving.value = false
  }
}

watch(() => props.kitchenId, () => void load(), { immediate: true })
</script>
