<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
      <UTextarea
        v-model="draft"
        :rows="5"
        :placeholder="placeholder"
      />

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
import { useAppPublicSettings } from '../../composables/fireux/app/useAppPublicSettings'
import { useFirestoreCreate } from '../../composables/fireux/firestore/operations/useFirestoreCreate'

const props = withDefaults(defineProps<{
  field: `featured_${string}_slugs`
  title: string
  description?: string
  placeholder?: string
}>(), {
  description: '',
  placeholder: 'slug-one, slug-two',
})

const { collectionPath, settings } = useAppPublicSettings()
const { setDocument } = useFirestoreCreate()
const draft = ref('')
const saving = ref(false)

const savedSlugs = computed(() => {
  const raw = settings.value?.[props.field]
  return Array.isArray(raw)
    ? raw.map((entry) => String(entry ?? '').trim()).filter(Boolean)
    : []
})

const slugs = computed(() => parseSlugs(draft.value))
const isDirty = computed(() => slugs.value.join('\n') !== savedSlugs.value.join('\n'))

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
  saving.value = true
  try {
    await setDocument(collectionPath, 'public', {
      ...(settings.value ?? {}),
      [props.field]: slugs.value,
    })
  } finally {
    saving.value = false
  }
}
</script>
