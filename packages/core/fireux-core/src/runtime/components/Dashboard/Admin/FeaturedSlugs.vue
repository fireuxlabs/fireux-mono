<template>
  <UCard>
    <template #header>
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">{{ title }}</h2>
          <p v-if="description" class="text-sm text-muted">{{ description }}</p>
        </div>

        <UBadge color="neutral" variant="soft">
          {{ slugs.length }} slug{{ slugs.length === 1 ? '' : 's' }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <UTextarea v-model="draft" :rows="5" :placeholder="placeholder" />

      <div v-if="slugs.length" class="flex flex-wrap gap-2">
        <UBadge
          v-for="slug in slugs"
          :key="slug"
          color="primary"
          variant="soft"
        >
          {{ slug }}
        </UBadge>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          color="primary"
          icon="i-lucide-save"
          :loading="saving"
          :disabled="!isDirty"
          @click="save"
        >
          Save
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          :disabled="!isDirty"
          @click="reset"
        >
          Reset
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUserSession } from '../../../user/composables/session/useUserSession'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAppFeaturedContent } from '../../../app/composables/featured/useAppFeaturedContent'

const props = withDefaults(
  defineProps<{
    field: `featured_${string}_slugs`
    title: string
    description?: string
    placeholder?: string
  }>(),
  {
    description: '',
    placeholder: 'slug-one, slug-two',
  }
)

const { settings, updateFeaturedSlugs, canUpdate } = useAppFeaturedContent()
const draft = ref('')
const saving = ref(false)
const { currentUser } = useAuth(),
  config = useFireUXConfig()
const { appUser } = useUserSession()
const completionSources = [
  () => appUser.value,
  () => props.field,
  draft,
  () => currentUser.value?.uid,
  () => config.appId,
  canUpdate,
]
const captureCompletion = useCommandScope(completionSources)
watch(
  completionSources,
  () => {
    saving.value = false
  },
  { flush: 'sync' }
)

const savedSlugs = computed(() => {
  const raw = settings.value?.[props.field]
  return Array.isArray(raw)
    ? raw.map((entry) => String(entry ?? '').trim()).filter(Boolean)
    : []
})

const slugs = computed(() => parseSlugs(draft.value))
const isDirty = computed(
  () => slugs.value.join('\n') !== savedSlugs.value.join('\n')
)

watch(
  savedSlugs,
  (next: string[]) => {
    if (isDirty.value) return
    draft.value = next.join(', ')
  },
  { immediate: true }
)

function parseSlugs(value: string) {
  return Array.from(
    new Set(
      String(value || '')
        .split(/[\n,]+/g)
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  )
}

function reset() {
  draft.value = savedSlugs.value.join(', ')
}

async function save() {
  const isCurrent = captureCompletion()
  saving.value = true
  try {
    await updateFeaturedSlugs(props.field, slugs.value)
  } catch (error) {
    if (isCurrent()) throw error
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
