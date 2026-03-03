<template>
  <UDashboardPanel id="stitch-console-provider-edit">
    <template #header>
      <LayoutsConsoleNavbar :title="provider?.display_name || 'Provider'" />
    </template>

    <template #body>
      <div class="space-y-4">
        <USkeleton v-if="pending" class="h-80 rounded-lg" />

        <UAlert v-else-if="!provider" color="error" variant="subtle" title="Provider not found" />

        <UAlert v-else-if="!canEdit" color="error" variant="subtle" title="Access restricted" description="You can only edit provider profiles you manage." />

        <UCard v-else>
          <div class="grid gap-4 md:grid-cols-2">
            <UInput v-model="form.display_name" placeholder="Display name" />
            <USelect v-model="form.type" :items="STITCH_PROVIDER_TYPE_OPTIONS" placeholder="Provider type" />
            <UInput v-model="form.website_url" placeholder="Website URL" />
            <UInput v-model="form.contact_email" placeholder="Contact email" />
            <UInput v-model="form.location" placeholder="Location" />
            <UInput v-model="form.timezone" placeholder="Timezone" />
            <USelect v-model="form.tags" :items="tagOptions" multiple placeholder="Tags" />
            <UInput v-model="customTags" placeholder="Additional tags (comma-separated)" />
            <USelect v-model="form.availability" :items="STITCH_PROVIDER_AVAILABILITY_OPTIONS" placeholder="Availability" />
            <UInput v-model="form.bio" class="md:col-span-2" placeholder="Bio" />
          </div>

          <template v-if="isAdmin">
            <USeparator class="my-4" />
            <div class="grid gap-4 md:grid-cols-2">
              <USelect v-model="adminVisibility" :items="booleanOptions" placeholder="Public visibility" />
              <USelect v-model="adminVerified" :items="booleanOptions" placeholder="Verification" />
            </div>
          </template>

          <USeparator class="my-4" />

          <div class="flex flex-wrap items-center gap-2">
            <UButton color="primary" :loading="loading" icon="i-lucide-save" @click="submit">Save</UButton>
            <UButton to="/console/providers" color="neutral" variant="ghost">Cancel</UButton>
          </div>
        </UCard>

        <UAlert v-if="error" color="error" variant="subtle" :title="error" />
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
  createStitchProviderDraft,
  STITCH_PROVIDER_TYPE_OPTIONS,
  STITCH_PROVIDER_AVAILABILITY_OPTIONS,
} from '../../../models/stitch.provider.model'

definePageMeta({ layout: 'console', requiresAuth: true })

const route = useRoute()
const providerId = computed(() => String(route.params.id || ''))

const { uid } = useAuth()
const { isAdmin } = useUser()
const { provider, pending } = useStitchProvider(providerId)
const { updateProvider, loading, error } = useStitchProviderUpdate()

const form = reactive(createStitchProviderDraft())
const customTags = ref('')
const adminVisibility = ref('true')
const adminVerified = ref('false')

const booleanOptions = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
]

watch(
  () => provider.value,
  (next: any) => {
    if (!next) return
    form.display_name = next.display_name
    form.type = next.type
    form.website_url = next.website_url || ''
    form.contact_email = next.contact_email || ''
    form.location = next.location || ''
    form.timezone = next.timezone || ''
    form.tags = [...(next.tags || [])]
    form.availability = next.availability
    form.bio = next.bio || ''
    form.is_public = next.is_public
    adminVisibility.value = String(next.is_public)
    adminVerified.value = String(next.is_verified)
  },
  { immediate: true }
)

const canEdit = computed(() => {
  if (!provider.value) return false
  return provider.value.created_by_uid === uid.value || isAdmin.value
})

const tagOptions = computed(() => {
  const merged = new Set([...(form.tags || []), ...STITCH_TAG_OPTIONS.map((tag) => tag.value)])
  return [...merged].sort((a, b) => a.localeCompare(b)).map((value) => ({ label: value, value }))
})

const submit = async () => {
  if (!provider.value) return

  const extras = customTags.value
    .split(',')
    .map((tag: string) => tag.trim())
    .filter(Boolean)

  await updateProvider(provider.value.id, {
    ...form,
    tags: [...new Set([...(form.tags || []), ...extras])],
    is_public: adminVisibility.value === 'true',
    is_verified: adminVerified.value === 'true',
  })

  await navigateTo('/console/providers')
}
</script>
