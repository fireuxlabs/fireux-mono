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
      :text="uc.initialsFor.value(user.value ?? null)"
    />
  </UButton>

  <!-- Expanded: reuse Pill component for consistent look -->
  <div v-else class="w-full cursor-pointer" @click="goProfile">
    <OrganismsUserCardsPill :user="pillUser" class="w-full" />
  </div>
</template>

<!-- packages/core/fireux-core/src/runtime/components/layouts/dashboard/UserMenu.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '../../../composables/firestore/core/user/useUser'
import type { UserCard } from '../../../models/core/user.model'
import { useUserComputed } from '../../../composables/firestore/core/user/useUserComputed'

defineOptions({ name: 'LayoutsDashboardUserMenu' })
defineProps<{ collapsed?: boolean }>()

const router = useRouter()
const { user } = useUser()
const uc = useUserComputed(user)

const activeDisplayName = computed(
  () => user.value?.app?.display_name || user.value?.core?.display_name || ''
)
const activeAvatar = computed(
  () => user.value?.app?.avatar || user.value?.core?.avatar || ''
)

// Avoid passing an empty string to UAvatar src (shows broken image). Return undefined instead.
const safeAvatarSrc = computed(() => {
  const s = activeAvatar.value ?? ''
  const trimmed = typeof s === 'string' ? s.trim() : ''
  return trimmed.length ? trimmed : undefined
})
const safeAlt = computed(() => activeDisplayName.value.trim() || 'User')
const pillUser = computed<UserCard.Pill | undefined>(() => {
  const u = user.value
  if (!u) return undefined
  return {
    id: u.id,
    display_name: activeDisplayName.value,
    avatar: safeAvatarSrc.value,
    initials: uc.initialsFor.value(user.value ?? null),
    role: (u as any).role, // if present in app doc
    handle: u.app?.handle || u.core?.handle,
  }
})

// No local mapping; pass the raw user into the Pill component

function goProfile() {
  router.push('/dashboard/user-profile')
}
</script>
