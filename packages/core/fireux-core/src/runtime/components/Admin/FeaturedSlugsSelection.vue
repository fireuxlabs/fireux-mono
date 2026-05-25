<template>
  <UDashboardPanel :id="panelId">
    <template #header>
      <LayoutsDashboardNavbar :title="navTitle" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody class="pagebody">
            <UPageCard
              :title="title"
              :description="description"
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
            </UPageCard>

            <slot
              :selected-values="draftSlugs"
              :toggle-slug="toggleSlug"
            />
          </UPageBody>
        </UPage>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToastify } from '../../composables/fireux/app/ui/useToastify'
import { useAppPublicSettings } from '../../composables/fireux/app/useAppPublicSettings'
import { useFirestoreCreate } from '../../composables/fireux/firestore/operations/useFirestoreCreate'

const props = withDefaults(defineProps<{
  field: `featured_${string}_slugs`
  panelId?: string
  navTitle?: string
  title?: string
  description?: string
  emptyLabel?: string
  savedLabel?: string
  failedLabel?: string
}>(), {
  panelId: 'dashboard-admin-featured-slugs',
  navTitle: 'Admin',
  title: 'Featured slugs',
  description: 'Select slugs to feature on public surfaces.',
  emptyLabel: 'No featured slugs selected yet.',
  savedLabel: 'Featured slugs saved',
  failedLabel: 'Failed to save featured slugs',
})

const toast = useToastify()
const { collectionPath, settings } = useAppPublicSettings()
const { setDocument } = useFirestoreCreate()
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
  (next) => {
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
  saving.value = true
  try {
    await setDocument(collectionPath, 'public', {
      ...(settings.value ?? {}),
      [props.field]: draftSlugs.value,
    })
    toast.success(props.savedLabel)
  } catch (error: any) {
    toast.error(String(error?.message || props.failedLabel))
  } finally {
    saving.value = false
  }
}
</script>
