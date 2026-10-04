<template>
  <UserProfile :user="user" />
  <UserAppMembership
    v-if="membershipVisible"
    :user="user"
    :membership="membership"
  />
  <DevDebugPanel
    title="User detail membership"
    context="App membership fetched by User Detail and the decisions derived from it."
    object-origin="fetched"
    :objects="{ membership }"
    :derived="{ subjectUserId, displayName, membershipVisible }"
    launcher
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useAppUserMembership } from '../../app/composables/membership/useAppUserMembership'
import type { User } from '../models/user.model'

const props = defineProps<{
  user: User
}>()

const subjectUserId = computed(() => props.user.id)
const displayName = computed(() => props.user.display_name)
const { membership, visible: membershipVisible } = useAppUserMembership({
  subjectUserId,
  displayName,
})
const { appName } = useFireUXConfig()

useSeo({
  title: computed(() => `${props.user.display_name} | ${appName}`),
  description: computed(() => props.user.bio || 'User profile.'),
  path: computed(() => `/users/${encodeURIComponent(props.user.handle)}`),
  image: computed(() => props.user.avatar),
  robots: 'index, follow',
})
</script>
