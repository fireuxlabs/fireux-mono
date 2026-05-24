<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">{{ title }}</h2>
          <p class="text-sm text-muted">{{ description }}</p>
        </div>

        <UBadge color="neutral" variant="soft">
          {{ slugs.length }} slug{{ slugs.length === 1 ? '' : 's' }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <UTextarea
        v-model="draft"
        :rows="5"
        :placeholder="placeholder"
      />

      <div v-if="unknownSlugs.length" class="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
        Unknown: {{ unknownSlugs.join(', ') }}
      </div>

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
          Save featured slugs
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
import { useAppPublicSettings } from 'fireux-core/runtime/composables/fireux/app/useAppPublicSettings'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'

const props = withDefaults(defineProps<{
  field: 'featured_app_slugs' | 'featured_ecosystem_slugs'
  title: string
  description: string
  knownSlugs?: string[]
  placeholder?: string
}>(), {
  knownSlugs: () => [],
  placeholder: 'one-slug-per-line',
})

const { collectionPath, settings } = useAppPublicSettings()
const { setDocument } = useFirestoreCreate()
const draft = ref('')
const saving = ref(false)

const savedSlugs = computed(() => {
  const raw = (settings.value as any)?.[props.field]
  return Array.isArray(raw)
    ? raw.map((entry) => String(entry ?? '').trim()).filter(Boolean)
    : []
})

const slugs = computed(() => parseSlugs(draft.value))
const isDirty = computed(() => slugs.value.join('\n') !== savedSlugs.value.join('\n'))
const knownSlugSet = computed(() => new Set(props.knownSlugs.map((slug) => slug.trim()).filter(Boolean)))
const unknownSlugs = computed(() =>
  slugs.value.filter((slug) => knownSlugSet.value.size > 0 && !knownSlugSet.value.has(slug))
)

watch(
  savedSlugs,
  (next) => {
    if (isDirty.value) return
    draft.value = next.join('\n')
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
  draft.value = savedSlugs.value.join('\n')
}

async function save() {
  saving.value = true
  try {
    await setDocument(collectionPath, 'public', {
      ...(settings.value ?? {}),
      [props.field]: slugs.value,
    } as any)
  } finally {
    saving.value = false
  }
}
</script>
