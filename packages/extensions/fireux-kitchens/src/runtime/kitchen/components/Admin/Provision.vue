<template>
  <UPageCard
    as="section"
    :title="`Add a Kitchen for ${ownerDisplayName}`"
    description="Find the Place first, then create or connect its Kitchen for this App member."
    icon="i-lucide-chef-hat"
    variant="subtle"
  >
    <div class="space-y-5">
      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-shield-check"
        :title="`Creating for ${ownerDisplayName}`"
        description="You remain signed in as the administrator. The selected member receives the Kitchen relationship and Team access."
      />

      <KitchenOnboarding
        :key="sessionKey"
        mode="root"
        :owner-user-id="ownerUserId"
        :select-workspace-on-complete="false"
        :return-to="returnTo"
        :cancel-to="cancelTo"
        @created="onCreated"
      />
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import type { KitchenOnboardingCompleteResult } from '../../models/kitchen-onboarding.model.ts'

defineOptions({ name: 'KitchenAdminProvision' })

const props = withDefaults(
  defineProps<{
    ownerUserId: string
    ownerDisplayName?: string
    returnTo?: string
    cancelTo?: string
  }>(),
  {
    ownerDisplayName: 'App member',
    returnTo: '/dashboard/admin/kitchens',
    cancelTo: '/dashboard/admin/kitchens',
  }
)

const emit = defineEmits<{
  (event: 'created', result: KitchenOnboardingCompleteResult): void
}>()

const toast = useToastify()
const sessionKey = ref(0)

async function onCreated(result: KitchenOnboardingCompleteResult) {
  toast.success(`Kitchen provisioned for ${props.ownerDisplayName}`)
  emit('created', result)
  await nextTick()
  sessionKey.value += 1
}
</script>
