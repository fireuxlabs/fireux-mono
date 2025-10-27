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
      :text="uc.initialsFor.value(user ?? null)"
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

const pillUser = computed<UserCard.Pill | undefined>(() => {
  const u = user.value
  if (!u) return undefined
  const base = uc.pillProps.value(u)
  return {
    ...base,
    id: u.id,
    role: (u as any).role,
  }
})

const safeAvatarSrc = computed(() => {
  const src = pillUser.value?.avatar ?? ''
  const trimmed = typeof src === 'string' ? src.trim() : ''
  return trimmed.length ? trimmed : undefined
})

const safeAlt = computed(() => pillUser.value?.title?.trim() || 'User')

// No local mapping; pass the raw user into the Pill component

function goProfile() {
  router.push('/dashboard/user-profile')
}
</script>
