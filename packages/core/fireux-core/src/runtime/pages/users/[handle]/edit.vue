<template>
  <UPage>
    <UPageHeader
      v-if="user"
      :title="`Edit ${user.display_name}`"
      description="Manage this User's current App membership."
    >
      <template #links>
        <UButton
          :to="profileTo"
          label="Back to profile"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <UPageCard
        v-if="user && canManageMembership && membershipVisible"
        :title="`${appName} membership`"
        icon="i-lucide-building-2"
        variant="subtle"
      >
        <UserAppMembershipEdit
          v-if="membership"
          :display-name="user.display_name"
          :membership="membership"
          :pending="subscriptionActionPending"
          :on-set-subscription="setSubscription"
        />
        <p v-else class="text-sm text-muted">
          No {{ appName }} membership record exists for {{ user.display_name }}.
          This is not the same as a Free subscription.
        </p>
      </UPageCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useSeo } from '../../../composables/fireux/seo/useSeo'
import { useRouteParam } from '../../../composables/shared/useRouteParam'
import { useUserAppMembership } from '../../../user/composables/useUserAppMembership'
import { useUserDetail } from '../../../user/composables/useUserDetail'

definePageMeta({
  layout: 'default',
  title: 'Edit User',
  description: 'Manage a User membership.',
  name: 'UserMembershipEditPage',
  requiresAuth: true,
  roles: ['admin'],
})

const { appName } = useFireUXConfig()
const handle = useRouteParam('handle')
const { user, ready } = useUserDetail(handle)
const subjectUserId = computed(() => user.value?.id || '')
const displayName = computed(() => user.value?.display_name || 'User')
const {
  membership,
  visible: membershipVisible,
  canManage: canManageMembership,
  subscriptionActionPending,
  setSubscription,
} = useUserAppMembership({ subjectUserId, displayName })

await ready

const profileTo = computed(() => `/users/${encodeURIComponent(handle.value)}`)
const title = computed(() =>
  user.value?.display_name
    ? `Edit ${user.value.display_name} | ${appName}`
    : `Edit User | ${appName}`
)
const description = computed(
  () => `Manage ${user.value?.display_name || 'this User'} in ${appName}.`
)
const path = computed(() => `/users/${encodeURIComponent(handle.value)}/edit`)

useSeo({
  title,
  description,
  path,
  robots: 'noindex, nofollow',
})
</script>
