<template>
  <MoleculesDisclosurePanel
    title="Languages"
    description="Enable reviewed Sproochli copy for this Kitchen and its public documents."
    icon="i-lucide-languages"
  >
    <UCard class="mt-4">
      <div class="space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <p class="text-sm font-semibold text-highlighted">
              Enable Sproochli
            </p>
            <p class="text-sm leading-5 text-dimmed">
              The Kitchen supplies language defaults. Each page and menu still
              publishes its own reviewed copy.
            </p>
          </div>

          <USwitch
            :model-value="enabled"
            :disabled="!writable || saving"
            :aria-label="enabled ? 'Disable Sproochli' : 'Enable Sproochli'"
            @update:model-value="save(Boolean($event), defaultLanguage)"
          />
        </div>

        <UFormField
          v-if="enabled"
          label="Default source"
          description="Choose the language state shown before a visitor selects a translation."
        >
          <UButtonGroup>
            <UButton
              v-for="option in defaultLanguageOptions"
              :key="option.value"
              color="neutral"
              :variant="defaultLanguage === option.value ? 'solid' : 'soft'"
              :disabled="!writable || saving"
              @click="save(true, option.value)"
            >
              {{ option.label }}
            </UButton>
          </UButtonGroup>
        </UFormField>

        <UAlert
          color="neutral"
          variant="soft"
          icon="i-lucide-shield-check"
          title="Server-side translation"
          description="Guests can request Menu translations through Sproochli's server memory. Reviewed language packs remain the only source of approved public brand copy."
        />

        <p v-if="saveState" class="text-xs text-dimmed">
          {{ saveState }}
        </p>
      </div>
    </UCard>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/console/useConsoleWriteGuard'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import type {
  SproochliAttachmentConfig,
  SproochliDefaultLanguage,
} from 'fireux-sproochli/runtime/sproochli'
import { computed, ref } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../composables/console/identity/useKitchenConsoleIdentity'
import { readKitchenSproochliConfig } from '../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const defaultLanguageOptions = [
  { label: 'Mixed', value: 'mixed' },
  { label: 'English', value: 'en' },
  { label: 'German', value: 'de' },
] as const satisfies ReadonlyArray<{
  label: string
  value: SproochliDefaultLanguage
}>

const toast = useToastify()
const fireux = useFireUXConfig()
const { refreshTargets } = useKitchenConsoleIdentity()
const { requireWritableData } = useConsoleWriteGuard('kitchen')
const saving = ref(false)
const saveState = ref('')
const writable = computed(() => props.canWrite)
const config = computed(() => readKitchenSproochliConfig(props.kitchen))
const enabled = computed(() => config.value.enabled)
const defaultLanguage = computed<SproochliDefaultLanguage>(
  () => config.value.default_language || 'mixed'
)
const ownerAppId = computed(() => {
  const management = readFireuxEntityManagement(props.kitchen?.management)
  return management
    ? resolveFireuxEntityManagementAppId(management, fireux.ecosystem)
    : ''
})

async function save(
  nextEnabled: boolean,
  nextDefaultLanguage: SproochliDefaultLanguage
) {
  if (!writable.value || !props.kitchenId || saving.value) return
  if (
    nextEnabled === enabled.value &&
    nextDefaultLanguage === defaultLanguage.value
  ) {
    return
  }

  const kitchenId = props.kitchenId
  const appId = ownerAppId.value
  saving.value = true
  saveState.value = 'Saving...'

  try {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    requireWritableData('live')
    if (!writable.value || props.kitchenId !== kitchenId) {
      throw new Error('The selected Kitchen changed before Sproochli could be saved.')
    }
    const result = await $fetch<{
      ok: true
      app_id: string
      kitchen_id: string
      sproochli: SproochliAttachmentConfig
    }>('/api/console/kitchen/sproochli', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        kitchen_id: kitchenId,
        enabled: nextEnabled,
        default_language: nextDefaultLanguage,
      },
    })
    if (
      result?.ok !== true ||
      result.kitchen_id !== kitchenId ||
      (appId && result.app_id !== appId)
    ) {
      throw new Error('Kitchen Sproochli response was invalid.')
    }

    await refreshTargets()
    saveState.value = 'Saved'
    toast.success(
      nextEnabled
        ? 'Sproochli enabled for this Kitchen'
        : 'Sproochli disabled for this Kitchen'
    )
  } catch (error) {
    saveState.value = 'Save failed'
    toast.error(
      error instanceof Error
        ? error.message
        : 'Kitchen Sproochli settings could not be saved.'
    )
  } finally {
    saving.value = false
  }
}
</script>
