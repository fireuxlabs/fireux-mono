<template>
  <ProfessionalCardsProfile
    v-if="professionalProfileView"
    :model="professionalProfileView"
  >
    <template #actions>
      <UButton
        label="Share profile"
        icon="i-lucide-share-2"
        color="primary"
        variant="soft"
        @click="shareProfile"
      />
      <UButton
        label="Print / save"
        icon="i-lucide-printer"
        color="neutral"
        variant="outline"
        @click="printProfile"
      />
      <UButton
        v-if="isSelf"
        label="Manage profile"
        icon="i-lucide-pencil"
        color="neutral"
        variant="outline"
        @click="navigateTo('/dashboard/professional/profile')"
      />
    </template>
  </ProfessionalCardsProfile>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo, useToast } from '#imports'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import type { ProfileDirectoryEntry } from 'fireux-core/runtime/user/models/user-directory.model'
import type { ProfessionalProfilePayload } from '../../../utils/profiles/Professional/professional'
import { useProfessionalInterface } from '../../../composables/profiles/Professional/utils/view/useProfessionalInterface'
import { useProfessionalProfileView } from '../../../composables/profiles/Professional/utils/view/useProfessionalProfileView'
const props = defineProps<{
  profile: ProfessionalProfilePayload & { id: string }
  user: ProfileDirectoryEntry<ProfessionalProfilePayload>['user']
}>()
const displayName = computed(() => props.user.display_name ?? '')
const canonicalPath = computed(
  () => `/professionals/${encodeURIComponent(props.user.handle)}`
)
const { user: sessionUser } = useUserSession()
const { profile: professionalInterface } = useProfessionalInterface()
const professionalCard = computed(() =>
  props.profile ? professionalInterface(props.profile, props.user) : null
)
const { model: professionalProfileView } = useProfessionalProfileView(
  computed(() => props.profile),
  professionalCard
)
const isSelf = computed(() =>
  Boolean(props.user?.id && sessionUser.value?.id === props.user.id)
)
const toast = useToast()

const profileShareTitle = computed(() =>
  [displayName.value, props.profile?.title]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' — ')
)

const copyProfileUrl = async (url: string) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url)
      return
    } catch {
      // Fall through to the selection-based copy path.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = url
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!copied) throw new Error('Clipboard copy failed')
}

const shareProfile = async () => {
  if (!import.meta.client) return

  const url = new URL(
    canonicalPath.value || window.location.pathname,
    window.location.origin
  ).toString()

  if (navigator.share) {
    try {
      await navigator.share({
        title: profileShareTitle.value || 'Professional profile',
        text: props.profile?.summary || undefined,
        url,
      })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  try {
    await copyProfileUrl(url)
    toast.add({
      title: 'Profile link copied',
      description: 'Ready to share.',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch {
    toast.add({
      title: 'Could not copy the profile link',
      description: url,
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
}

const printProfile = () => {
  if (import.meta.client) window.print()
}
</script>
