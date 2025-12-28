<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsProfilesProfessionalPreview />

      <OrganismsProfilesProfessionalSectionsLocalCollection
        v-if="showLocalDirectory"
      />

      <section class="space-y-2">
        <div
          v-if="isTenant"
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm font-medium">Directory scope</p>
            <p class="text-xs text-slate-500">
              Toggle which directory sources are rendered on this page.
            </p>
          </div>
          <UButton
            variant="ghost"
            @click="showGlobalDirectory = !showGlobalDirectory"
          >
            {{
              showGlobalDirectory
                ? 'Hide global professionals'
                : 'View global professionals'
            }}
          </UButton>
        </div>

        <OrganismsProfilesProfessionalSectionsGlobalCollection
          v-if="showGlobalDirectory"
        />
      </section>

      <section class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-medium text-slate-500">
            Debug directory payloads
          </p>

          <UButton size="xs" variant="ghost" @click="showDebug = !showDebug">
            {{ showDebug ? 'Hide debug data' : 'Show debug data' }}
          </UButton>
        </div>

        <UCard v-if="showDebug">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div>
                <h3 class="text-base font-semibold">Professionals data</h3>
                <p class="text-sm opacity-70">
                  Raw profiles with resolved cell props to diagnose empty pills.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <UBadge variant="soft">
                  {{ debugCounts.local }} local ·
                  {{ debugCounts.global }} global
                </UBadge>
                <UButton
                  size="xs"
                  icon="i-lucide-copy"
                  variant="ghost"
                  @click="copyDebugJson"
                >
                  Copy JSON
                </UButton>
              </div>
            </div>
          </template>

          <pre class="fx-debug-panel">{{ debugJson }}</pre>
        </UCard>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from 'nuxt/app'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useProfessionalCollection } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import {
  type ProfessionalProfile,
} from '../../models/profiles/Professional/Professional.model.ts'
import { resolveProfessionalCell } from '../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface.ts'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-briefcase',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Professionals',
  description: 'Professional profiles resolved for this runtime.',
  layout: 'default',
  name: 'ProfessionalsIndexPage',
})

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(true)
const showDebug = ref(false)

const { localProfessionals, globalProfessionals } = useProfessionalCollection()

const loadedLocal = computed(() => Boolean(localProfessionals?.value))
const localEntries = computed(() => localProfessionals?.value ?? [])
const globalEntries = computed(() => globalProfessionals?.value ?? [])
const localHasProfiles = computed(() => (localEntries.value?.length ?? 0) > 0)

const showLocalDirectory = computed(
  () => isTenant && (localHasProfiles.value || !loadedLocal.value)
)

const formatProfile = (profile: ProfessionalProfile | null, index: number) => {
  if (!profile) return null
  const resolved = resolveProfessionalCell(profile)

  return {
    index,
    profileId: profile.id ?? null,
    profileTitle: profile.title ?? null,
    userId: profile.user?.id ?? null,
    userDisplayName: profile.user?.display_name ?? null,
    userAvatar: profile.user?.avatar ?? null,
    resolved,
  }
}

const debugCounts = computed(() => ({
  local: localEntries.value?.length ?? 0,
  global: globalEntries.value?.length ?? 0,
}))

const debugPayload = computed(() => ({
  local: localEntries.value
    .map((profile, index) => formatProfile(profile, index))
    .filter(Boolean),
  global: globalEntries.value
    .map((profile, index) => formatProfile(profile, index))
    .filter(Boolean),
}))

const debugJson = computed(() => JSON.stringify(debugPayload.value, null, 2))

const { copy: copyToClipboard } = useClipboard()
const copyDebugJson = () => {
  copyToClipboard(debugJson.value ?? '')
}

const pageTitle = 'Professionals'
const pageDescription =
  'Inspect your professional profile and browse all professionals available to this runtime.'

useHead({ title: pageTitle })
</script>

<style scoped>
.fx-debug-panel {
  max-height: 24rem;
  overflow: auto;
  padding: 0.5rem;
  background: rgba(15, 23, 42, 0.04);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  white-space: pre-wrap;
}
</style>
