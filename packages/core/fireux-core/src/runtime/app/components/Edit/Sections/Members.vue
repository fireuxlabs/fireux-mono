<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>Members</h3>
          <p>
            People with access to this app.
          </p>
        </div>
      </div>
    </template>

    <div v-if="rows.length" class="section__item space-y-2">
      <ul class="space-y-2">
        <li
          v-for="member in rows"
          :key="member.id"
          class="flex flex-wrap items-center justify-between gap-3"
        >
          <UserCardsPill
            v-bind="pillFor(member)"
            :link="Boolean(pillFor(member).to)"
            class="min-w-0"
          />

          <div class="flex shrink-0 items-center gap-2">
            <UBadge
              size="xs"
              :color="member.role === 'admin' || member.role === 'dev' ? 'primary' : 'neutral'"
              variant="soft"
            >
              {{ member.role }}
            </UBadge>

            <USelect
              :model-value="member.subscription"
              :items="subscriptionOptions"
              value-key="value"
              label-key="label"
              size="sm"
              class="w-32"
              :loading="subscriptionActionUid === member.id"
              :disabled="subscriptionActionUid !== null"
              :aria-label="`Subscription for ${member.display_name}`"
              @update:model-value="onSubscriptionChange(member, $event)"
            />
          </div>
        </li>
      </ul>
    </div>
    <p v-else class="section__empty">No members yet.</p>
  </UCard>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../user/composables/useUserInterface'
import type { AppUserSubscription } from '../../../models/app-user.model.ts'

type MemberRow = {
  id: string
  role: 'admin' | 'user' | 'dev'
  subscription: AppUserSubscription
  display_name: string
}

const props = defineProps<{
  rows: MemberRow[]
  subscriptionActionUid: string | null
  pillFor: (row: MemberRow) => UserCard
  onSetSubscription: (value: {
    uid: string
    subscription: AppUserSubscription
  }) => Promise<unknown>
}>()

const subscriptionOptions: Array<{
  label: string
  value: AppUserSubscription
}> = [
  { label: 'Free', value: 'free' },
  { label: 'Premium', value: 'premium' },
  { label: 'Business', value: 'business' },
]

async function onSubscriptionChange(
  member: MemberRow,
  subscription: AppUserSubscription
) {
  if (subscription === member.subscription) return
  await props.onSetSubscription({ uid: member.id, subscription })
}
</script>
