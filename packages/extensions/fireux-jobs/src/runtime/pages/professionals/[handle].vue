<template>
  <UserProfileDetailSurface
    entity-label="Professional"
    plural-label="Professionals"
    back-to="/professionals"
    icon="i-lucide-briefcase-business"
    :pending="pending"
    :failed="failed"
    :missing="missing"
  >
    <div v-if="professionalProfile" data-public-profile="professional">
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

<DevDebugPanel
  object-origin="fetched"
        launcher
        include-route
        title="Professional (Public DTO)"
        context="Professional detail · professionals/[handle] · endpoint-first SSR"
        :objects="devObjects"
        :derived="devDerived"
        :default-open="false"
      />
    </div>
  </UserProfileDetailSurface>
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import { navigateTo, setResponseStatus, useToast } from '#imports'
import { useProfileDetail } from 'fireux-core/runtime/user/composables/profile/useProfileDetail'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import { useProfessionalSeo } from '../../user/composables/profiles/Professional/utils/useProfessionalSeo'
import { useProfessionalInterface } from '../../user/composables/profiles/Professional/utils/view/useProfessionalInterface'
import { useProfessionalProfileView } from '../../user/composables/profiles/Professional/utils/view/useProfessionalProfileView'
import type { ProfessionalProfilePayload } from '../../user/utils/profiles/Professional/professional'

definePageMeta({
  visibility: { profiles: ['professional'] },
})

const routeHandle = useRouteParam('handle')
const requestedIdentifier = computed(() => routeHandle.value || null)

const {
  profile: professionalProfile,
  user: profileUser,
  pending,
  statusCode,
  missing,
  failed,
  outcome,
} = await useProfileDetail<ProfessionalProfilePayload>(
  { collection: 'professionals', kind: 'professional' },
  requestedIdentifier
)

const canonicalHandle = computed(() =>
  String(profileUser.value?.handle || '')
    .trim()
    .toLowerCase()
)
const canonicalPath = computed(() =>
  canonicalHandle.value
    ? `/professionals/${encodeURIComponent(canonicalHandle.value)}`
    : ''
)

if (
  canonicalPath.value &&
  requestedIdentifier.value !== canonicalHandle.value
) {
  await navigateTo(canonicalPath.value, { redirectCode: 301, replace: true })
}

const { user: sessionUser } = useUserSession()
const { profile: professionalInterface } = useProfessionalInterface()
const professionalCard = computed(() =>
  professionalProfile.value
    ? professionalInterface(professionalProfile.value, profileUser.value)
    : null
)
const { model: professionalProfileView } = useProfessionalProfileView(
  professionalProfile,
  professionalCard
)
const displayName = computed(() => profileUser.value?.display_name ?? '')
const isSelf = computed(() =>
  Boolean(
    profileUser.value?.id && sessionUser.value?.id === profileUser.value.id
  )
)
const toast = useToast()

const profileShareTitle = computed(() =>
  [displayName.value, professionalProfile.value?.title]
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
        text: professionalProfile.value?.summary || undefined,
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

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 400 ? statusCode.value : 503)
  }
}

useProfessionalSeo(professionalProfile, {
  routeKey: canonicalHandle,
  displayName,
})

const devObjects = computed(() => ({
  profile: professionalProfile.value,
  user: profileUser.value,
}))
const devDerived = computed(() => ({
  outcome: outcome.value,
  canonicalPath: canonicalPath.value,
}))
</script>

<style>
@media print {
  body:has([data-public-profile='professional']) [data-fireux-header-root],
  body:has([data-public-profile='professional']) .fx-layout-shell > footer,
  body:has([data-public-profile='professional']) .fireux-dev-json {
    display: none !important;
  }

  body:has([data-public-profile='professional']) .fx-layout-main > div {
    max-width: none;
    padding-left: 0;
    padding-right: 0;
  }

  body:has([data-public-profile='professional']) .pagebody {
    margin-top: 0;
    padding-bottom: 0;
  }
}
</style>
