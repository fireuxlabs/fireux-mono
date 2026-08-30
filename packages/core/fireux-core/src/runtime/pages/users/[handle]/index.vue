<template>
  <UPage>
    <UPageBody>
      <!-- 01 Identity — the route resolves and passes the canonical User. -->
      <UserProfile
        v-if="user"
        :user="user"
        :is-own-profile="isOwnProfile"
        :can-edit="isOwnProfile"
        :subscription="isOwnProfile ? viewerSubscription : null"
      />

      <!-- 02 App membership — an authorized, separately named App record. -->
      <UserAppMembership
        v-if="user && membershipVisible"
        :app-name="appName"
        :display-name="user.display_name"
        :membership="membership"
        :can-manage="canManageMembership"
        :edit-to="editTo"
        :subscription-action-pending="subscriptionActionPending"
        :on-set-subscription="setSubscription"
      />
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
  title: 'User',
  description: 'View a user profile.',
  name: 'UserDetailPage',
})

const { appName } = useFireUXConfig()
const handle = useRouteParam('handle')
const { user, ready } = useUserDetail(handle)
const subjectUserId = computed(() => user.value?.id || '')
const displayName = computed(() => user.value?.display_name || 'User')
const {
  membership,
  visible: membershipVisible,
  isOwnProfile,
  canManage: canManageMembership,
  viewerSubscription,
  subscriptionActionPending,
  setSubscription,
} = useUserAppMembership({ subjectUserId, displayName })

await ready

const editTo = computed(() => `/users/${encodeURIComponent(handle.value)}/edit`)
const title = computed(() =>
  user.value?.display_name
    ? `${user.value.display_name} | ${appName}`
    : `User | ${appName}`
)
const description = computed(() => user.value?.bio || 'User profile.')
const path = computed(() => `/users/${encodeURIComponent(handle.value)}`)

useSeo({
  title,
  description,
  path,
  image: computed(() => user.value?.avatar),
  robots: 'index, follow',
})
</script>
