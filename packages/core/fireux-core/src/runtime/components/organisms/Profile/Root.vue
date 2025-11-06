<!-- packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue -->
<template>
  <div class="space-y-6">
    <!-- current (whatever exists: core/app) -->
    <slot name="current-assets" :profile="profileApi.profileComputed.value" />

    <!-- CTA when missing (global OR app overlay) -->
    <div v-if="showCreate">
      <UPageSection>
        <UPageCTA
          :title="
            ctaMessage || `Complete your ${props.config.profileType} profile`
          "
          variant="soft"
        >
          <template #links>
            <!-- Allow consumer to fully override links if desired -->
            <slot name="cta-links">
              <UButton
                size="lg"
                color="primary"
                :label="primaryLabel"
                :loading="ensuring"
                :disabled="ensuring"
                @click="onEnsureClick"
              />
            </slot>
          </template>
        </UPageCTA>
      </UPageSection>
    </div>

    <!-- Simple list -->
    <UPageSection>
      <div class="flex items-center gap-2 mb-3">
        <span class="opacity-70 text-sm">Showing: {{ showing }}</span>
        <UButton
          v-if="hasLocal && !hasGlobalLoaded"
          size="xs"
          variant="ghost"
          @click="fetchGlobal"
        >
          Load global
        </UButton>
      </div>

      <div v-if="list.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <template v-for="p in list" :key="p.id || p.uid">
          <slot name="item" :profile="p" />
        </template>
      </div>
      <p v-else class="opacity-70">No profiles yet.</p>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProfileConfig } from '../../../models/core/profile.model.ts'
import { useProfile } from '../../../composables/firestore/core/profile/useProfile.ts'
import { useFireUXConfig } from '../../../composables/FireUXConfig.ts'

const props = defineProps<{
  config: ProfileConfig
  onEnsure?: () => Promise<any> // <- optional external ensure handler
}>()

// unified profile + computed signals
const profileApi = useProfile(props.config)
const { isTenant } = useFireUXConfig()

const hasCoreProfile = computed(() =>
  Boolean(profileApi.profile.coreProfile.value)
)
const hasAppProfile = isTenant
  ? computed(() => Boolean(profileApi.profile.appProfile.value))
  : undefined
const ctaMessage = computed(() => {
  if (hasCoreProfile.value) return null
  return (
    props.config.cta ||
    `Complete your ${props.config.profileType} profile to continue.`
  )
})

// CTA visible if missing global OR app overlay
const showCreate = computed(() => {
  const hasCore = hasCoreProfile.value
  const hasApp = hasAppProfile?.value ?? true
  return !(hasCore && hasApp)
})

const primaryLabel = computed(() =>
  hasCoreProfile.value
    ? 'Add to this app'
    : `Create ${props.config.profileType} profile`
)

const ensuring = ref(false)
async function onEnsureClick() {
  if (ensuring.value) return
  ensuring.value = true
  try {
    if (props.onEnsure) {
      await props.onEnsure() // use external handler if provided
    } else {
      await profileApi.ensure() // fallback to generic ensure
    }
  } finally {
    ensuring.value = false
  }
}

/* ------- Minimal list wiring ------- */
const hasLocal = computed(() => Boolean(profileApi.collection.local))
const hasGlobalLoaded = computed(() =>
  Boolean(profileApi.collection.global?.value)
)
const showing = computed<'local' | 'global'>(() =>
  hasLocal.value ? 'local' : 'global'
)
const list = computed<any[]>(
  () =>
    (profileApi.collection.local?.value as any[]) ??
    (profileApi.collection.global?.value as any[]) ??
    []
)
function fetchGlobal() {
  profileApi.collection.fetchGlobal?.()
}
</script>
