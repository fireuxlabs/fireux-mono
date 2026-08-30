<template>
  <div class="space-y-3">
    <UFormField
      label="Subscription"
      :description="`Set ${displayName}'s current App subscription.`"
    >
      <USelect
        :model-value="membership.subscription"
        :items="subscriptionOptions"
        value-key="value"
        label-key="label"
        size="sm"
        class="w-full sm:w-48"
        :loading="pending"
        :disabled="pending"
        :aria-label="`Subscription for ${displayName}`"
        @update:model-value="setSubscription"
      />
    </UFormField>

    <p class="text-xs text-muted">
      Business enables multiple Kitchens. A missing membership is not a Free
      subscription.
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  isAppUserSubscription,
  type AppUserSubscription,
} from '../../../app/models/app-user.model.ts'
import type { UserAppMembershipRecord } from '../../composables/useUserAppMembership'

defineOptions({ name: 'UserAppMembershipEdit' })

const props = withDefaults(
  defineProps<{
    displayName: string
    membership: UserAppMembershipRecord
    pending?: boolean
    onSetSubscription: (subscription: AppUserSubscription) => Promise<unknown>
  }>(),
  { pending: false }
)

async function setSubscription(value: unknown) {
  if (
    !isAppUserSubscription(value) ||
    value === props.membership.subscription ||
    props.pending
  ) {
    return
  }
  await props.onSetSubscription(value)
}

const subscriptionOptions: Array<{
  label: string
  value: AppUserSubscription
}> = [
  { label: 'Free', value: 'free' },
  { label: 'Premium', value: 'premium' },
  { label: 'Business', value: 'business' },
]
</script>
