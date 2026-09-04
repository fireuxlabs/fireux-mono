<template>
  <UPageCard
    as="section"
    variant="subtle"
    class="rounded-3xl"
    :ui="{ container: 'p-5 sm:p-7' }"
  >
    <div class="flex flex-col gap-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-building-2" class="size-4 text-primary" />
            <h2 class="font-semibold text-highlighted">
              {{ appName }} membership
            </h2>
          </div>
          <p class="mt-1 text-sm text-muted">
            App-specific role, subscription, and workspace allowance.
          </p>
        </div>

        <div v-if="canManage" class="flex flex-wrap items-center gap-2">
          <UBadge
            label="Admin controls"
            icon="i-lucide-shield-check"
            color="neutral"
            variant="soft"
          />
          <UButton
            :to="editTo"
            label="Open editor"
            icon="i-lucide-pencil"
            color="neutral"
            variant="soft"
            size="sm"
          />
        </div>
      </div>

      <template v-if="membership">
        <div class="flex flex-wrap items-center gap-2">
          <UserAccessBadge :subscription="membership.subscription" />
          <UBadge
            :label="roleLabel"
            icon="i-lucide-shield-check"
            color="neutral"
            variant="soft"
          />
        </div>

        <dl class="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt class="text-muted">Role</dt>
            <dd class="mt-1 font-medium text-highlighted">{{ roleLabel }}</dd>
          </div>
          <div>
            <dt class="text-muted">Subscription</dt>
            <dd class="mt-1 font-medium text-highlighted">
              {{ subscriptionLabel }}
            </dd>
          </div>
          <div>
            <dt class="text-muted">Multiple kitchens</dt>
            <dd class="mt-1 font-medium text-highlighted">
              {{ canOwnMultipleKitchens ? 'Enabled' : 'Not included' }}
            </dd>
          </div>
        </dl>

        <UserAppMembershipEdit
          v-if="canManage"
          :display-name="user.display_name"
          :membership="membership"
          :pending="subscriptionActionPending"
          :on-set-subscription="setSubscription"
        />
      </template>

      <p v-else class="text-sm text-muted">
        No {{ appName }} membership record exists for {{ user.display_name }}. This is
        not the same as a Free subscription.
      </p>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AppUserSubscription } from '../../app/models/app-user.model.ts'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useToastify } from '../../composables/ui/useToastify'
import type { UserAppMembershipRecord } from '../composables/useUserAppMembership'
import { mutateAppUser } from '../../app/composables/appUserMutation'
import { useUser } from '../composables/useUser'
import type { User } from '../models/user.model.ts'

defineOptions({ name: 'UserAppMembership' })

const props = defineProps<{
  user: User
  membership: UserAppMembershipRecord | null
}>()

const { appName } = useFireUXConfig()
const { isAdmin, isDeveloper } = useUserSession()
const canManage = computed(() => isAdmin.value || isDeveloper.value)
const editTo = computed(
  () => `/users/${encodeURIComponent(props.user.handle)}/edit`
)
const subscriptionActionPending = ref(false)
const toast = useToastify()

async function setSubscription(subscription: AppUserSubscription) {
  const membership = props.membership
  if (
    !canManage.value ||
    !membership ||
    membership.subscription === subscription ||
    subscriptionActionPending.value
  ) {
    return
  }

  subscriptionActionPending.value = true
  try {
    await mutateAppUser({
      action: 'set-subscription',
      userId: membership.id,
      subscription,
    })
    membership.subscription = subscription
    toast.success(`${props.user.display_name} is now ${subscription}.`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Subscription update failed: ${message}`)
  } finally {
    subscriptionActionPending.value = false
  }
}

const roleLabel = computed(() => {
  if (!props.membership) return ''
  if (props.membership.role === 'dev') return 'Developer'
  return props.membership.role === 'admin' ? 'Administrator' : 'User'
})
const subscriptionLabel = computed(() => {
  const subscription = props.membership?.subscription || ''
  return subscription
    ? subscription.charAt(0).toUpperCase() + subscription.slice(1)
    : ''
})
const canOwnMultipleKitchens = computed(
  () => props.membership?.subscription === 'business'
)
</script>
