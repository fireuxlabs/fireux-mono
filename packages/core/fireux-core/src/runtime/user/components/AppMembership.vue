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
            v-if="editTo"
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
          v-if="canManage && onSetSubscription"
          :display-name="displayName"
          :membership="membership"
          :pending="subscriptionActionPending"
          :on-set-subscription="onSetSubscription"
        />
      </template>

      <p v-else class="text-sm text-muted">
        No {{ appName }} membership record exists for {{ displayName }}. This is
        not the same as a Free subscription.
      </p>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppUserSubscription } from '../../app/models/app-user.model.ts'
import type { UserAppMembershipRecord } from '../composables/useUserAppMembership'

defineOptions({ name: 'UserAppMembership' })

const props = defineProps<{
  appName: string
  displayName: string
  membership: UserAppMembershipRecord | null
  canManage?: boolean
  editTo?: string
  subscriptionActionPending?: boolean
  onSetSubscription?: (subscription: AppUserSubscription) => Promise<unknown>
}>()

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
