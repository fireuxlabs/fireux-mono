<template>
  <div class="pagebody">
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
        :loading="pending"
        :disabled="pending"
        :aria-label="`Subscription for ${displayName}`"
        @update:model-value="setSubscription"
      />
    </UFormField>

    <p>
      Business supports multiple Workspaces where this App allows them.
      Membership and subscription are managed separately.
    </p>
  </div>
</template>

<script setup lang="ts">
import { isAppUserSubscription } from '../../utils/validation.ts'
import { type AppUserSubscription } from '../../models/model.ts'
import type { AppUserMembershipRecord } from '../../composables/useAppUserMembership'

defineOptions({ name: 'AppUserMembershipEdit' })

const props = withDefaults(
  defineProps<{
    displayName: string
    membership: AppUserMembershipRecord
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
  { label: 'Pro', value: 'pro' },
  { label: 'Business', value: 'business' },
]
</script>
