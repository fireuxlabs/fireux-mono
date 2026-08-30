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

      <!-- 03 Kitchen administration — Misebox composes the Kitchen-owned workflow. -->
      <KitchenAdminProvision
        v-if="user && membership && canManageMembership"
        :owner-user-id="user.id"
        :owner-display-name="user.display_name"
        :return-to="path"
        :cancel-to="path"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useUserAppMembership } from 'fireux-core/runtime/user/composables/useUserAppMembership'
import { useUserDetail } from 'fireux-core/runtime/user/composables/useUserDetail'

definePageMeta({
  layout: 'default',
  title: 'User',
  description: 'View a user profile.',
  name: 'MiseboxUserDetailPage',
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

const path = computed(() => `/users/${encodeURIComponent(handle.value)}`)
const editTo = computed(() => `${path.value}/edit`)
const title = computed(() =>
  user.value?.display_name
    ? `${user.value.display_name} | ${appName}`
    : `User | ${appName}`
)
const description = computed(() => user.value?.bio || 'User profile.')

useSeo({
  title,
  description,
  path,
  image: computed(() => user.value?.avatar),
  robots: 'index, follow',
})
</script>
