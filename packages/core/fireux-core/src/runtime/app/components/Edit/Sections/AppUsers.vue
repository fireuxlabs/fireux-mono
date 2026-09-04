<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>App users</h3>
          <p>People with an AppUser relationship to this App.</p>
        </div>
      </div>
    </template>

    <div v-if="rows.length" class="section__item space-y-2">
      <ul class="space-y-2">
        <li
          v-for="appUser in rows"
          :key="appUser.id"
          class="flex flex-wrap items-center justify-between gap-3"
        >
          <UserCardsPill
            v-bind="pillFor(appUser)"
            :link="Boolean(pillFor(appUser).to)"
            class="min-w-0"
          />

          <div class="flex shrink-0 items-center gap-2">
            <UBadge
              size="xs"
              :color="
                appUser.role === 'admin' || appUser.role === 'dev'
                  ? 'primary'
                  : 'neutral'
              "
              variant="soft"
            >
              {{ appUser.role }}
            </UBadge>

            <USelect
              :model-value="appUser.subscription"
              :items="subscriptionOptions"
              value-key="value"
              label-key="label"
              size="sm"
              class="w-32"
              :loading="subscriptionActionUid === appUser.id"
              :disabled="subscriptionActionUid !== null"
              :aria-label="`Subscription for ${appUser.display_name}`"
              @update:model-value="onSubscriptionChange(appUser, $event)"
            />
          </div>
        </li>
      </ul>
    </div>
    <p v-else class="section__empty">No AppUsers yet.</p>
  </UCard>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../user/composables/useUserView'
import type { AppUserSubscription } from '../../../models/app-user.model.ts'

type AppUserRow = {
  id: string
  role: 'admin' | 'user' | 'dev'
  subscription: AppUserSubscription
  display_name: string
}

const props = defineProps<{
  rows: AppUserRow[]
  subscriptionActionUid: string | null
  pillFor: (row: AppUserRow) => UserCard
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
  appUser: AppUserRow,
  subscription: AppUserSubscription
) {
  if (subscription === appUser.subscription) return
  await props.onSetSubscription({ uid: appUser.id, subscription })
}
</script>
