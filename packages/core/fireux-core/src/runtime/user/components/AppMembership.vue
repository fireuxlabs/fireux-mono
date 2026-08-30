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

        <UBadge
          v-if="canManage"
          label="Admin controls"
          icon="i-lucide-shield-check"
          color="neutral"
          variant="soft"
        />
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
            <dd class="mt-1">
              <USelect
                v-if="canManage"
                :model-value="membership.subscription"
                :items="subscriptionOptions"
                value-key="value"
                label-key="label"
                size="sm"
                class="w-36"
                :loading="subscriptionActionPending"
                :disabled="subscriptionActionPending"
                :aria-label="`Subscription for ${displayName}`"
                @update:model-value="setSubscription"
              />
              <span v-else class="font-medium text-highlighted">
                {{ subscriptionLabel }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-muted">Multiple kitchens</dt>
            <dd class="mt-1 font-medium text-highlighted">
              {{ canOwnMultipleKitchens ? 'Enabled' : 'Not included' }}
            </dd>
          </div>
        </dl>
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
import type { AppAdminMember } from '../../app/models/app-context.model.ts'
import {
  isAppUserSubscription,
  type AppUserSubscription,
} from '../../app/models/app-user.model.ts'

defineOptions({ name: 'UserAppMembership' })

type UserAppMembershipRecord = Pick<
  AppAdminMember,
  'id' | 'role' | 'subscription'
>

const props = defineProps<{
  appName: string
  displayName: string
  membership: UserAppMembershipRecord | null
  canManage?: boolean
  subscriptionActionPending?: boolean
  onSetSubscription?: (subscription: AppUserSubscription) => Promise<unknown>
}>()

const subscriptionOptions: Array<{
  label: string
  value: AppUserSubscription
}> = [
  { label: 'Free', value: 'free' },
  { label: 'Premium', value: 'premium' },
  { label: 'Business', value: 'business' },
]

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

async function setSubscription(value: unknown) {
  if (
    !props.canManage ||
    !props.membership ||
    !props.onSetSubscription ||
    !isAppUserSubscription(value) ||
    value === props.membership.subscription
  ) {
    return
  }
  await props.onSetSubscription(value)
}
</script>
