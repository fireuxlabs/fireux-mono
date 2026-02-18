<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/kitchens"
        >
          Back
        </UButton>
        <UButton
          v-if="canEdit && kitchenId"
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-pencil"
          @click="goToEdit"
        >
          Edit
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div v-if="loading" class="py-10 text-sm opacity-70">
        Loading kitchen...
      </div>

      <div v-else-if="!kitchen" class="space-y-2">
        <h1 class="text-lg font-semibold">Kitchen Not Found</h1>
        <p>The kitchen you are looking for does not exist.</p>
        <NuxtLink to="/kitchens" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <KitchenCardsProfile
          v-if="kitchenProfile"
          :model="kitchenProfile"
        />

        <DevJson
          v-if="isDev && kitchen"
          :title="'Kitchen (Doc)'"
          context="Kitchen detail page · kitchens/[id] · hydrated kitchen doc"
          :data="kitchen"
          :default-open="false"
        />

        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Permissions</div>
              <p class="text-xs text-dimmed">
                Edit access follows kitchen claim ownership and app admin role.
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge
                size="xs"
                variant="soft"
                :color="canEdit ? 'primary' : 'neutral'"
              >
                {{ canEdit ? 'Can edit' : 'Read only' }}
              </UBadge>
              <UBadge v-if="isOwner" size="xs" variant="soft" color="emerald">
                Owner
              </UBadge>
              <UBadge v-else-if="isAdmin" size="xs" variant="soft" color="primary">
                Admin override
              </UBadge>
              <UBadge
                v-if="claimedByLabel"
                size="xs"
                variant="soft"
                color="neutral"
              >
                Claimed by: {{ claimedByLabel }}
              </UBadge>
            </div>

            <p class="text-sm text-dimmed">
              {{ permissionMessage }}
            </p>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="canEdit && kitchenId"
                size="xs"
                variant="soft"
                color="primary"
                icon="i-lucide-pencil"
                @click="goToEdit"
              >
                Edit kitchen
              </UButton>
              <UButton
                v-else
                size="xs"
                variant="soft"
                color="neutral"
                icon="i-lucide-eye"
              >
                View only
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from '../../models/kitchen.model'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  head: { title: 'Kitchen' },
  name: 'KitchensDetailPage',
})

const { appName } = useFireUXConfig()
const route = useRoute()

const raw = route.params.id
const kitchenId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { kitchen: fetchKitchen } = useKitchenFetch()
const rawDoc = kitchenId ? fetchKitchen(kitchenId) : null
const kitchen = computed<Kitchen | null>(() => rawDoc?.value ?? null)
const loading = computed(() => Boolean(kitchenId) && rawDoc?.value === undefined)

const { profile } = useKitchenInterface()
const kitchenProfile = computed(() => profile(kitchen.value))

const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() => String(kitchen.value?.claimed_by || '').trim())
const claimedByLabel = computed(() => claimedBy.value || '')
const isOwner = computed(() => Boolean(claimedBy.value && currentUser.value?.id === claimedBy.value))
const canEdit = computed(() => {
  if (!claimedBy.value) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || isOwner.value)
})

const permissionMessage = computed(() => {
  if (canEdit.value) {
    return 'You can edit this kitchen.'
  }
  if (!claimedBy.value) {
    return 'This kitchen is unclaimed. Only admins can edit unclaimed kitchens.'
  }
  return 'This kitchen is claimed by another user. You can view details but cannot edit.'
})

const pageTitle = computed(() => kitchen.value?.name || 'Kitchen')
const pageDescription = computed(() =>
  kitchen.value?.short_address || kitchen.value?.formatted_address || 'Kitchen details.'
)
const isDev = import.meta.dev

const goToEdit = async () => {
  if (!kitchenId) return
  await navigateTo(`/kitchens/edit/${encodeURIComponent(kitchenId)}`)
}

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})
</script>
