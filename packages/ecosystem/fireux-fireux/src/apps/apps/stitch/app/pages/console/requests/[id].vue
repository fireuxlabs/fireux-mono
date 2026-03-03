<template>
  <UDashboardPanel id="stitch-console-request-edit">
    <template #header>
      <LayoutsConsoleNavbar :title="request?.title || 'Request'" />
    </template>

    <template #body>
      <div class="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div class="space-y-4">
          <USkeleton v-if="pending" class="h-96 rounded-lg" />

          <UAlert v-else-if="!request" color="error" variant="subtle" title="Request not found" />

          <UAlert v-else-if="!canEdit" color="error" variant="subtle" title="Access restricted" description="You can only edit requests that you created." />

          <UCard v-else>
            <div class="grid gap-4 md:grid-cols-2">
              <UInput v-model="form.title" placeholder="Title" class="md:col-span-2" />
              <UInput v-model="form.summary" placeholder="Summary" class="md:col-span-2" />
              <UInput v-model="form.scope" placeholder="Scope" />
              <USelect v-model="form.status" :items="STITCH_REQUEST_STATUS_OPTIONS" placeholder="Status" />
              <USelect v-model="form.budget_type" :items="STITCH_REQUEST_BUDGET_TYPE_OPTIONS" placeholder="Budget type" />
              <USelect v-model="form.tags" :items="tagOptions" multiple placeholder="Tags" />
              <UInput v-model="customTags" class="md:col-span-2" placeholder="Additional tags (comma-separated)" />
              <UInput v-model.number="form.budget_min" type="number" placeholder="Budget min" />
              <UInput v-model.number="form.budget_max" type="number" placeholder="Budget max" />
              <UInput v-model="form.start_date" type="date" placeholder="Start date" />
              <UInput v-model="form.duration" placeholder="Duration" />
              <UInput v-model="form.timezone" placeholder="Timezone" />
            </div>

            <USeparator class="my-4" />

            <div class="flex flex-wrap items-center gap-2">
              <UButton color="primary" :loading="loading" icon="i-lucide-save" @click="submit">Save</UButton>
              <UButton to="/console/requests" color="neutral" variant="ghost">Cancel</UButton>
            </div>
          </UCard>

          <UAlert v-if="error" color="error" variant="subtle" :title="error" />
        </div>

        <div class="space-y-4">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-sparkles" class="text-primary" />
                <p class="font-medium">Suggested providers</p>
              </div>
            </template>

            <div v-if="!suggestedProviders.length" class="text-sm text-muted">
              Add request tags to see connected providers with active availability.
            </div>

            <div v-else class="space-y-3">
              <div v-for="provider in suggestedProviders" :key="provider.id" class="rounded-lg border p-3">
                <p class="font-medium">{{ provider.display_name }}</p>
                <p class="text-xs text-muted">{{ provider.availability }}</p>
                <div class="mt-2 flex flex-wrap gap-1">
                  <UBadge v-for="tag in provider.tags.slice(0, 4)" :key="tag" :label="tag" color="primary" variant="subtle" />
                </div>
                <UButton :to="`/directory/${provider.id}`" size="xs" class="mt-2" color="neutral" variant="outline">View</UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, navigateTo } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { STITCH_TAG_OPTIONS } from '../../../constants/stitch.tags'
import {
  createStitchRequestDraft,
  STITCH_REQUEST_BUDGET_TYPE_OPTIONS,
  STITCH_REQUEST_STATUS_OPTIONS,
} from '../../../models/stitch.request.model'

definePageMeta({ layout: 'console', requiresAuth: true })

const route = useRoute()
const requestId = computed(() => String(route.params.id || ''))

const { uid } = useAuth()
const { isAdmin } = useUser()

const { request, pending } = useStitchRequest(requestId)
const { updateRequest, loading, error } = useStitchRequestUpdate()

const { providers } = useStitchProviders({ onlyPublic: true })

const form = reactive(createStitchRequestDraft())
const customTags = ref('')

watch(
  () => request.value,
  (next: any) => {
    if (!next) return
    form.title = next.title
    form.summary = next.summary
    form.scope = next.scope
    form.tags = [...(next.tags || [])]
    form.budget_type = next.budget_type
    form.budget_min = next.budget_min
    form.budget_max = next.budget_max
    form.start_date = typeof next.start_date === 'string' ? next.start_date : ''
    form.duration = next.duration || ''
    form.timezone = next.timezone || ''
    form.status = next.status
  },
  { immediate: true }
)

const canEdit = computed(() => {
  if (!request.value) return false
  return request.value.created_by_uid === uid.value || isAdmin.value
})

const tagOptions = computed(() => {
  const merged = new Set([...(form.tags || []), ...STITCH_TAG_OPTIONS.map((tag) => tag.value)])
  return [...merged].sort((a, b) => a.localeCompare(b)).map((value) => ({ label: value, value }))
})

const suggestedProviders = computed(() => {
  const tags = form.tags || []
  if (!tags.length) return []

  return providers.value
    .filter((provider) => provider.availability !== 'unavailable')
    .filter((provider) => provider.tags.some((tag) => tags.includes(tag)))
    .slice(0, 8)
})

const submit = async () => {
  if (!request.value) return

  const extras = customTags.value
    .split(',')
    .map((tag: string) => tag.trim())
    .filter(Boolean)

  await updateRequest(request.value.id, {
    ...form,
    tags: [...new Set([...(form.tags || []), ...extras])],
  })

  await navigateTo('/console/requests')
}
</script>
