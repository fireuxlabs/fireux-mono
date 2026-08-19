<!-- Concurrent edit — 2026-07-21 17:07 CEST — Dashboard Family pass: make featured selection outcome-safe and bind save controls to App-admin authority. -->
<template>
  <UPageHeader
    :headline="headline"
    :title="title"
    :description="description"
  >
    <template #links>
      <UButton
        :to="backTo"
        label="Back to admin"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="soft"
      />
    </template>
  </UPageHeader>

  <MoleculesStateCard
    v-if="settingsOutcome === 'idle' || settingsOutcome === 'pending'"
    entity="featured selection"
    kind="document"
    loading
  />

  <MoleculesStateCard
    v-else-if="settingsOutcome === 'error'"
    entity="featured selection"
    kind="document"
    state="error"
  />

  <div v-else class="space-y-6">
    <UPageCard
      title="Current selection"
      description="Choose what appears first on the public surface, then save your changes."
      icon="i-lucide-star"
      variant="subtle"
    >
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="neutral" variant="soft">
            {{ draftSlugs.length }} selected
          </UBadge>

          <UBadge
            v-for="slug in draftSlugs"
            :key="slug"
            color="primary"
            variant="soft"
          >
            {{ slug }}
          </UBadge>
        </div>

        <p v-if="!draftSlugs.length" class="text-sm text-muted">
          {{ emptyLabel }}
        </p>

        <div class="flex flex-wrap gap-2">
          <UButton
            label="Save selection"
            color="primary"
            icon="i-lucide-save"
            :loading="saving"
            :disabled="!isDirty || !canUpdate"
            @click="save"
          />
          <UButton
            label="Reset"
            color="neutral"
            variant="ghost"
            :disabled="!isDirty || saving"
            @click="reset"
          />
        </div>
      </div>
    </UPageCard>

    <slot
      :selected-values="draftSlugs"
      :toggle-slug="toggleSlug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToastify } from '../../composables/ui/useToastify'
import {
  useAppPublicSettings,
  type AppFeaturedSlugField,
} from '../../app/composables/useAppPublicSettings'

const props = withDefaults(defineProps<{
  field: AppFeaturedSlugField
  headline?: string
  title?: string
  description?: string
  emptyLabel?: string
  savedLabel?: string
  failedLabel?: string
  backTo?: string
}>(), {
  headline: 'Admin curation',
  title: 'Featured slugs',
  description: 'Select slugs to feature on public surfaces.',
  emptyLabel: 'No featured slugs selected yet.',
  savedLabel: 'Featured slugs saved',
  failedLabel: 'Failed to save featured slugs',
  backTo: '/dashboard/admin',
})

const toast = useToastify()
const {
  settings,
  outcome: settingsOutcome,
  canUpdate,
  updateFeaturedSlugs,
} = useAppPublicSettings()
const draftSlugs = ref<string[]>([])
const saving = ref(false)

const clean = (value: unknown) => String(value ?? '').trim()

const savedSlugs = computed(() => {
  const raw = settings.value?.[props.field]
  return Array.isArray(raw)
    ? raw.map((entry) => clean(entry)).filter(Boolean)
    : []
})

const isDirty = computed(
  () => draftSlugs.value.join('\n') !== savedSlugs.value.join('\n')
)

watch(
  savedSlugs,
  (next: string[]) => {
    if (isDirty.value) return
    draftSlugs.value = [...next]
  },
  { immediate: true }
)

function toggleSlug(value: string) {
  const slug = clean(value)
  if (!slug) return

  const next = new Set(draftSlugs.value)
  if (next.has(slug)) {
    next.delete(slug)
  } else {
    next.add(slug)
  }

  draftSlugs.value = Array.from(next)
}

function reset() {
  draftSlugs.value = [...savedSlugs.value]
}

async function save() {
  if (!isDirty.value || saving.value || !canUpdate.value) return
  saving.value = true
  try {
    await updateFeaturedSlugs(props.field, draftSlugs.value)
    toast.success(props.savedLabel)
  } catch (error: any) {
    toast.error(String(error?.message || props.failedLabel))
  } finally {
    saving.value = false
  }
}
</script>
