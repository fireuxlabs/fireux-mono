<template>
  <UPageCard
    v-if="canProvision"
    as="section"
    :title="`Add a Kitchen for ${user.display_name}`"
    description="Find a kitchen to add for this App member."
    icon="i-lucide-chef-hat"
    variant="subtle"
  >
    <div class="space-y-5">
      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-shield-check"
        :title="`Creating for ${user.display_name}`"
        description="You remain signed in as the administrator. The selected member receives the Kitchen relationship and Team access."
      />

      <KitchenOnboarding
        :key="sessionKey"
        mode="root"
        :owner-user-id="user.id"
        :select-workspace-on-complete="false"
        :return-to="returnTo"
        :cancel-to="cancelTo"
        @created="onCreated"
      />
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import type { User } from 'fireux-core/runtime/user/models/user.model'
import type { KitchenOnboardingCompleteResult } from '../../models/kitchen-onboarding.model.ts'

defineOptions({ name: 'KitchenAdminProvision' })

const props = withDefaults(
  defineProps<{
    user: Pick<User, 'id' | 'handle' | 'display_name'>
    returnTo?: string
    cancelTo?: string
  }>(),
  {
    returnTo: '',
    cancelTo: '',
  }
)

const emit = defineEmits<{
  (event: 'created', result: KitchenOnboardingCompleteResult): void
}>()

const toast = useToastify()
const sessionKey = ref(0)
const { isAdmin, isDeveloper } = useUserSession()
const canProvision = computed(() => isAdmin.value || isDeveloper.value)
const userPath = computed(
  () => `/users/${encodeURIComponent(props.user.handle)}`
)
const returnTo = computed(() => props.returnTo || userPath.value)
const cancelTo = computed(() => props.cancelTo || userPath.value)

async function onCreated(result: KitchenOnboardingCompleteResult) {
  toast.success(`Kitchen provisioned for ${props.user.display_name}`)
  emit('created', result)
  await nextTick()
  sessionKey.value += 1
}
</script>
