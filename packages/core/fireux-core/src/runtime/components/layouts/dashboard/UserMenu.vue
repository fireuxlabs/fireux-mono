<template>
  <!-- Collapsed: compact avatar button -->
  <UButton
    v-if="collapsed"
    color="neutral"
    variant="ghost"
    block
    :square="true"
    class="data-[state=open]:bg-elevated"
    aria-label="Open profile"
    @click="goProfile"
  >
    <UAvatar
      size="sm"
      class="shrink-0"
      :src="safeAvatarSrc"
      :alt="safeAlt"
      :text="uc.initials"
    />
  </UButton>

  <!-- Expanded: reuse Pill component for consistent look -->
  <div v-else class="w-full cursor-pointer" @click="goProfile">
    <OrganismsUserCardsPill :user="user" class="w-full" />
  </div>
</template>

<!-- packages/core/fireux-core/src/runtime/components/layouts/dashboard/UserMenu.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '../../../composables/firestore/user/useUser'
import { useUserComputed } from '../../../composables/firestore/user/useUserComputed'

defineOptions({ name: 'LayoutsDashboardUserMenu' })
defineProps<{ collapsed?: boolean }>()

const router = useRouter()
const { user } = useUser()
const uc = useUserComputed(user)

// Avoid passing an empty string to UAvatar src (shows broken image). Return undefined instead.
const safeAvatarSrc = computed(() => {
  const s = uc.avatarSrc?.value ?? ''
  const trimmed = typeof s === 'string' ? s.trim() : ''
  return trimmed.length ? trimmed : undefined
})
const safeAlt = computed(() => uc.displayName?.value?.trim() || 'User')

// No local mapping; pass the raw user into the Pill component

function goProfile() {
  router.push('/dashboard/user-profile')
}
</script>
