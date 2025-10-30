<template>
  <ClientOnly>
    <div class="profile-page">
      <!-- Loading -->
      <slot name="loading" v-if="loading">
        <div class="py-10 text-sm opacity-70">Loading profile…</div>
      </slot>

      <!-- Not found -->
      <slot name="not-found" v-else-if="!profile">
        <div class="space-y-2">
          <h1 class="text-lg font-semibold">Profile Not Found</h1>
          <p>The profile you're looking for doesn't exist.</p>
          <NuxtLink :to="fallbackHref" class="text-primary hover:underline">
            ← Back
          </NuxtLink>
        </div>
      </slot>

      <!-- Profile -->
      <div v-else class="space-y-4">
        <!-- Optional edit button -->
        <div v-if="canEdit && editPath">
          <UButton
            icon="i-lucide-pencil"
            size="md"
            color="primary"
            variant="solid"
            @click="navigateTo(editPath)"
          >
            Edit Profile
          </UButton>
        </div>

        <!-- Custom renderer (slot) or default -->
        <slot name="profile" :profile="profile">
          <UCard class="profile-card max-w-3xl">
            <div class="profile-header flex gap-4 items-center">
              <UAvatar
                :src="resolveAvatar(profile)"
                :alt="resolveName(profile)"
                size="lg"
              />
              <div class="profile-info">
                <h1 class="profile-name text-xl font-semibold">
                  {{ resolveName(profile) }}
                </h1>
                <p v-if="profile?.title" class="profile-title opacity-80">
                  {{ profile.title }}
                </p>
              </div>
            </div>

            <p v-if="bioText" class="profile-bio mt-4">
              {{ bioText }}
            </p>
          </UCard>
        </slot>
      </div>
    </div>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading profile…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'

declare function useRoute(): any
declare function navigateTo(path: string): Promise<unknown>
declare function useHead(input: unknown): void
declare function useSeoMeta(input: unknown): void

/** Props */
const props = defineProps<{
  /** ProfileConfig for this domain (chef, professional, employer, supplier) */
  config: ProfileConfig
  /** Route param name for id; default 'id' */
  idParamName?: string
  /** Edit page path; when set and viewer owns the profile, an Edit button shows */
  editPath?: string
  /** Fallback link (Back) */
  fallbackHref?: string
  /** Optional title used for static SEO; dynamic title comes from profile */
  pageTitle?: string
  /** Optional description for static SEO */
  pageDescription?: string
}>()

/** Defaults */
const idParamName = props.idParamName ?? 'id'
const fallbackHref = computed(
  () => props.fallbackHref ?? `/${props.config.collectionName}`
)

/** SEO (static baseline) */
useSeoMeta({
  title: props.pageTitle ?? 'Profile',
  description: props.pageDescription ?? 'View profile',
})

/** Route + id */
const route = useRoute()
const raw = route.params[idParamName]
const docId = Array.isArray(raw) ? raw[0] : String(raw || '')

/** Current app user (for edit visibility) */
const { user } = useUser()
const appUser = computed(() => user.value?.appUser)

/** Fetch profile doc */
const { firestoreFetchDoc } = useFirestoreRead()
const rawDoc = docId
  ? await firestoreFetchDoc(props.config.collectionName, docId)
  : null

/** Normalized reactive value (supports composable’s ref or plain object) */
const profile = computed<any>(() => (rawDoc as any)?.value ?? rawDoc ?? null)
const loading = computed(() => !rawDoc && !!docId)

/** Can edit? */
const canEdit = computed(
  () =>
    !!(
      appUser.value?.id &&
      profile.value?.id &&
      appUser.value.id === profile.value.id
    )
)

/** Helpers */
const resolveName = (p: any) =>
  p?.display_name ||
  p?.name ||
  p?.company_name ||
  p?.business_name ||
  p?.professional_name ||
  'Profile'

const resolveAvatar = (p: any) =>
  p?.avatar || p?.avatarUrl || p?.profile_image?.url || undefined

const bioText = computed(
  () => profile.value?.bio_long ?? profile.value?.bio_short ?? ''
)

/** Dynamic head from loaded data */
useHead({
  title: computed(() =>
    profile.value
      ? `${resolveName(profile.value)} - Profile`
      : props.pageTitle ?? 'Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(
        () => bioText.value || props.pageDescription || 'View profile'
      ),
    },
  ],
})
</script>
