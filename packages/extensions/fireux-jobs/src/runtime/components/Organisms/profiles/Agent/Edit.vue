<template>
  <ClientOnly>
    <div v-if="record" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Display Name"
            :firebase-value="record.display_name || ''"
            placeholder="Company or organization name"
            :update-function="handleDisplayName"
            :validation-function="validateDisplayName"
            :formatting-function="formatDisplayName"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Headline"
            :firebase-value="coreProfile?.title || ''"
            placeholder="Add a headline or role"
            :update-function="updateCoreTitle"
          />
        </div>
      </UCard>

      <UCard>
        <div class="space-y-4">
          <header class="space-y-1">
            <h3 class="text-base font-semibold text-gray-900">Core Profile</h3>
            <p class="text-sm text-gray-500">
              Shared across every FireUX app that lists this agent.
            </p>
          </header>

          <MoleculesFormsFirestoreSimpleField
            label="Short Bio"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="coreProfile?.bio_short || ''"
            placeholder="Summarize your company in a few sentences"
            :update-function="updateCoreBioShort"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Long Bio"
            type="textarea"
            :rows="6"
            :maxlength="1000"
            :firebase-value="coreProfile?.bio_long || ''"
            placeholder="Tell the deeper story of your organization"
            :update-function="updateCoreBioLong"
          />

          <MoleculesFormsFirestoreArrayOfStrings
            label="Specialties"
            :firebase-value="coreProfile?.specialties || []"
            item-placeholder="Add specialty"
            new-item-placeholder="Add specialty"
            :update-function="updateCoreSpecialties"
          />
        </div>
      </UCard>

      <UCard v-if="canEditAppOverlay">
        <div class="space-y-4">
          <header class="space-y-1">
            <h3 class="text-base font-semibold text-gray-900">App Overlay</h3>
            <p class="text-sm text-gray-500">
              {{ appCardDescription }}
            </p>
          </header>

          <MoleculesFormsFirestoreSimpleField
            label="Headline Override"
            :firebase-value="appProfile?.title || ''"
            placeholder="Optional tenant-specific headline"
            :update-function="updateAppTitle"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Short Bio Override"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="appProfile?.bio_short || ''"
            placeholder="Tailor the short bio for this app"
            :update-function="updateAppBioShort"
          />

          <MoleculesFormsFirestoreArrayOfStrings
            label="App Specialties"
            :firebase-value="appProfile?.specialties || []"
            item-placeholder="Add specialty"
            new-item-placeholder="Add specialty"
            :update-function="updateAppSpecialties"
          />
        </div>
      </UCard>

      <UCard>
        <dl class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1">
            <dt class="text-sm font-medium text-gray-500">Agent ID</dt>
            <dd class="text-sm font-semibold text-gray-900">{{ record.id }}</dd>
          </div>

          <div class="space-y-1">
            <dt class="text-sm font-medium text-gray-500">Core Updated</dt>
            <dd class="text-sm text-gray-900">{{ coreUpdatedAt }}</dd>
          </div>

          <div class="space-y-1">
            <dt class="text-sm font-medium text-gray-500">Core Specialties</dt>
            <dd class="text-sm text-gray-900">
              {{ coreSpecialtiesCount }} item{{
                coreSpecialtiesCount === 1 ? '' : 's'
              }}
            </dd>
          </div>

          <div class="space-y-1">
            <dt class="text-sm font-medium text-gray-500">App Overlay</dt>
            <dd class="text-sm text-gray-900">{{ appOverlayStatus }}</dd>
          </div>

          <div v-if="canEditAppOverlay" class="space-y-1">
            <dt class="text-sm font-medium text-gray-500">App Updated</dt>
            <dd class="text-sm text-gray-900">{{ appUpdatedAt }}</dd>
          </div>
        </dl>
      </UCard>
    </div>

    <MoleculesNotFound
      v-else
      entity="agent profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Agent } from '../../../../models/profiles/Agent.model'
import { useAgentUpdate } from '../../../../composables/firestore/profiles/Agent/main/useAgentUpdate'
import { useAgentFormattingAndValidation } from '../../../../composables/firestore/profiles/Agent/utils'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { formatFirestoreTimestamp } from 'fireux-core/runtime/utils/formatTimestamp.ts'

const props = defineProps<{ agent: Agent | null }>()

const record = computed(() => props.agent)
const coreProfile = computed(() => record.value?.core ?? null)
const appProfile = computed(() => record.value?.app ?? null)

const fireUXConfig = useFireUXConfig()
const canEditAppOverlay = computed(() => fireUXConfig.isTenant)

const { updateDisplayName, updateCore, updateApp } = useAgentUpdate()
const { formatDisplayName, validateDisplayName } =
  useAgentFormattingAndValidation()

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const coreUpdatedAt = computed(
  () =>
    formatFirestoreTimestamp(
      coreProfile.value?.updated_at || coreProfile.value?.created_at,
      {
        fallback: 'Never updated',
        format: { dateStyle: 'medium', timeStyle: 'short' },
      }
    ) ?? 'Never updated'
)

const appUpdatedAt = computed(
  () =>
    formatFirestoreTimestamp(
      appProfile.value?.updated_at || appProfile.value?.created_at,
      {
        fallback: appProfile.value ? 'Never updated' : 'Not customized',
        format: { dateStyle: 'medium', timeStyle: 'short' },
      }
    ) ?? (appProfile.value ? 'Never updated' : 'Not customized')
)

const coreSpecialtiesCount = computed(
  () => coreProfile.value?.specialties?.length ?? 0
)

const appOverlayStatus = computed(() => {
  if (!canEditAppOverlay.value) return 'Global scope only'
  return appProfile.value ? 'Active' : 'Not customized'
})

const appCardDescription = computed(() =>
  appProfile.value
    ? 'These overrides apply only to this tenant.'
    : 'Add tenant-specific messaging without changing the global profile.'
)

const cleanString = (value: string | null | undefined) => {
  const input = typeof value === 'string' ? value.trim() : ''
  return input.length ? input : null
}

const handleDisplayName = async (value: string) => {
  const formatted = formatDisplayName(value)
  const validationResult = validateDisplayName(formatted)
  if (validationResult === true) {
    try {
      await updateDisplayName(formatted)
      toast?.add({
        title: 'Display name updated',
        icon: 'i-heroicons-check-circle',
      })
      return 'success'
    } catch (error) {
      const description =
        error instanceof Error ? error.message : 'Please try again.'
      toast?.add({
        title: 'Failed to update display name',
        description,
        color: 'amber',
        icon: 'i-heroicons-exclamation-triangle',
      })
      throw error
    }
  }
  throw new Error(
    typeof validationResult === 'string'
      ? validationResult
      : 'Invalid display name'
  )
}

const handleCoreUpdate = async (
  partial: Record<string, unknown>,
  message?: string
) => {
  const id = record.value?.id
  if (!id) return 'success'
  const result = await updateCore(partial, id)
  if (message) {
    toast?.add({ title: message, icon: 'i-heroicons-check-circle' })
  }
  return result
}

const handleAppUpdate = async (
  partial: Record<string, unknown>,
  message?: string
) => {
  if (!canEditAppOverlay.value) return 'success'
  const id = record.value?.id
  if (!id) return 'success'
  const result = await updateApp(partial, id)
  if (message) {
    toast?.add({ title: message, icon: 'i-heroicons-check-circle' })
  }
  return result
}

const updateCoreTitle = (value: string) =>
  handleCoreUpdate({ title: cleanString(value) }, 'Headline updated')

const updateCoreBioShort = (value: string) =>
  handleCoreUpdate({ bio_short: cleanString(value) }, 'Short bio updated')

const updateCoreBioLong = (value: string) =>
  handleCoreUpdate({ bio_long: cleanString(value) }, 'Long bio updated')

const updateCoreSpecialties = (value: string[]) =>
  handleCoreUpdate({ specialties: value }, 'Core specialties updated')

const updateAppTitle = (value: string) =>
  handleAppUpdate({ title: cleanString(value) }, 'App headline updated')

const updateAppBioShort = (value: string) =>
  handleAppUpdate({ bio_short: cleanString(value) }, 'App bio updated')

const updateAppSpecialties = (value: string[]) =>
  handleAppUpdate({ specialties: value }, 'App specialties updated')
</script>
