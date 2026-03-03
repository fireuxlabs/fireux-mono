<template>
  <UPage>
    <UPageHeader title="Join as a provider" description="List your SEO capacity so teams can connect with you." />

    <UPageBody class="pagebody space-y-4">
      <UAlert
        v-if="!isAuthenticated"
        color="warning"
        variant="subtle"
        title="Sign in required"
        description="Sign in to create your provider profile."
      >
        <template #actions>
          <UButton :to="`/auth?redirect=${encodeURIComponent('/join')}`" color="primary" variant="soft">Sign in</UButton>
        </template>
      </UAlert>

      <UCard>
        <div class="grid gap-4 md:grid-cols-2">
          <UInput v-model="form.display_name" label="Display name" placeholder="Your name or agency" :disabled="!isAuthenticated" />
          <USelect v-model="form.type" :items="STITCH_PROVIDER_TYPE_OPTIONS" placeholder="Provider type" :disabled="!isAuthenticated" />
          <UInput v-model="form.website_url" placeholder="Website URL" :disabled="!isAuthenticated" />
          <UInput v-model="form.contact_email" placeholder="Contact email (optional)" :disabled="!isAuthenticated" />
          <UInput v-model="form.location" placeholder="Location (optional)" :disabled="!isAuthenticated" />
          <UInput v-model="form.timezone" placeholder="Timezone (optional)" :disabled="!isAuthenticated" />
          <USelect v-model="form.tags" :items="tagOptions" multiple placeholder="Tags" :disabled="!isAuthenticated" />
          <UInput v-model="customTags" placeholder="Additional tags (comma-separated)" :disabled="!isAuthenticated" />
          <USelect v-model="form.availability" :items="STITCH_PROVIDER_AVAILABILITY_OPTIONS" placeholder="Availability" :disabled="!isAuthenticated" />
          <UInput v-model="form.bio" class="md:col-span-2" placeholder="Short bio" :disabled="!isAuthenticated" />
        </div>

        <USeparator class="my-4" />

        <div class="flex flex-wrap items-center gap-2">
          <UButton color="primary" :loading="loading" :disabled="!isAuthenticated" icon="i-lucide-user-plus" @click="submit">
            Join as provider
          </UButton>
          <UButton to="/directory" color="neutral" variant="ghost">Cancel</UButton>
        </div>
      </UCard>

      <UAlert v-if="error" color="error" variant="subtle" :title="error" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { navigateTo } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  createStitchProviderDraft,
  STITCH_PROVIDER_TYPE_OPTIONS,
  STITCH_PROVIDER_AVAILABILITY_OPTIONS,
} from '../models/stitch.provider.model'
import { STITCH_TAG_OPTIONS } from '../constants/stitch.tags'

definePageMeta({ requiresAuth: true })

const { isAuthenticated } = useAuth()
const { createProvider, loading, error } = useStitchProviderCreate()

const form = reactive(createStitchProviderDraft())
const customTags = ref('')

const tagOptions = computed(() => STITCH_TAG_OPTIONS.map((option) => ({ label: option.label, value: String(option.value) })))

const mergedTags = () => {
  const extras = customTags.value
    .split(',')
    .map((tag: string) => tag.trim())
    .filter(Boolean)

  return [...new Set([...(form.tags || []), ...extras])]
}

const submit = async () => {
  if (!isAuthenticated.value) {
    await navigateTo(`/auth?redirect=${encodeURIComponent('/join')}`)
    return
  }

  const providerId = await createProvider({ ...form, tags: mergedTags() })
  await navigateTo(`/console/providers/${providerId}`)
}
</script>
