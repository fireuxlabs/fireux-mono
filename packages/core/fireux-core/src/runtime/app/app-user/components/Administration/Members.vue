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

    <div v-if="rows.length" class="section__item">
      <ul>
        <li v-for="appUser in rows" :key="appUser.id">
          <UserCardsPill
            v-bind="pillFor(appUser)"
            :link="Boolean(pillFor(appUser).to)"
          />

          <div>
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

            <UButton
              v-if="appUser.role === 'user'"
              size="xs"
              variant="soft"
              :loading="roleActionUid === appUser.id"
              :disabled="roleActionUid !== null"
              :aria-label="`Make ${appUser.display_name} an App admin`"
              @click="onMakeAdmin(appUser.id)"
            >
              Make admin
            </UButton>

            <USelect
              :model-value="appUser.subscription"
              :items="subscriptionOptions"
              value-key="value"
              label-key="label"
              size="sm"
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
    <UButton v-if="hasMore" variant="soft" @click="$emit('load-more')">
      Load more members
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import type { UserPillProps } from '../../../../user/components/Cards/Pill.vue'
import type { AppUserSubscription } from '../../models/model.ts'

type AppUserRow = {
  id: string
  role: 'admin' | 'user' | 'dev'
  subscription: AppUserSubscription
  display_name: string
}

const props = defineProps<{
  hasMore?: boolean
  rows: AppUserRow[]
  roleActionUid: string | null
  subscriptionActionUid: string | null
  pillFor: (row: AppUserRow) => UserPillProps
  onMakeAdmin: (uid: string) => Promise<unknown>
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
  { label: 'Pro', value: 'pro' },
  { label: 'Business', value: 'business' },
]

async function onSubscriptionChange(
  appUser: AppUserRow,
  subscription: AppUserSubscription
) {
  if (subscription === appUser.subscription) return
  await props.onSetSubscription({ uid: appUser.id, subscription })
}
defineEmits<{ 'load-more': [] }>()
</script>
