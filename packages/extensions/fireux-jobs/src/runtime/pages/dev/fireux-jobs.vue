<template>
  <UPage>
    <UPageBody class="space-y-6">
      <!-- Current Professional -->
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold">Current Professional</h1>
        </template>

        <template v-if="professionalMeta">
          <div class="current-entity">
            <OrganismsProfilesProfessionalCardsPill
              v-if="professionalPill"
              :professional="professionalPill"
            />

            <dl class="meta-grid">
              <div>
                <dt>ID</dt>
                <dd>{{ professionalMeta.id }}</dd>
              </div>
              <div>
                <dt>Title</dt>
                <dd>{{ professionalMeta.title }}</dd>
              </div>
              <div>
                <dt>Subtitle</dt>
                <dd>{{ professionalMeta.subtitle }}</dd>
              </div>
              <div>
                <dt>Display Name</dt>
                <dd>{{ professionalMeta.displayName }}</dd>
              </div>
              <div>
                <dt>Updated At</dt>
                <dd>{{ professionalMeta.updatedAt }}</dd>
              </div>
            </dl>
          </div>
        </template>
        <MoleculesNotFound v-else kind="document" entity="professional" />

        <template #footer>
          <DevJsonPanel
            v-if="activeProfessionalProfile"
            :data="activeProfessionalProfile"
          />
        </template>
      </UCard>

      <!-- Current Employer -->
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold">Current Employer</h1>
        </template>

        <template v-if="employerMeta">
          <div class="current-entity">
            <OrganismsProfilesEmployerCardsPill
              v-if="employerPill"
              :employer="employerPill"
            />

            <dl class="meta-grid">
              <div>
                <dt>ID</dt>
                <dd>{{ employerMeta.id }}</dd>
              </div>
              <div>
                <dt>Title</dt>
                <dd>{{ employerMeta.title }}</dd>
              </div>
              <div>
                <dt>Subtitle</dt>
                <dd>{{ employerMeta.subtitle }}</dd>
              </div>
              <div>
                <dt>Display Name</dt>
                <dd>{{ employerMeta.displayName }}</dd>
              </div>
              <div>
                <dt>Updated At</dt>
                <dd>{{ employerMeta.updatedAt }}</dd>
              </div>
            </dl>
          </div>
        </template>
        <MoleculesNotFound v-else kind="document" entity="employer" />

        <template #footer>
          <DevJsonPanel
            v-if="activeEmployerProfile"
            :data="activeEmployerProfile"
          />
        </template>
      </UCard>

      <!-- Global Professionals -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-base font-semibold">Global Professionals</h2>
            <UBadge variant="soft">{{ globalProfessionalCount }} total</UBadge>
          </div>
          <p class="text-sm opacity-70">
            Profiles resolved from the global professionals collection.
          </p>
        </template>

        <div
          v-if="globalProfessionalPills.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OrganismsProfilesProfessionalCardsPill
            v-for="pill in globalProfessionalPills"
            :key="professionalPillKey(pill)"
            :professional="pill"
          />
        </div>

        <p v-else class="text-sm opacity-70">No global professionals found.</p>

        <template #footer>
          <DevJsonPanel
            v-if="globalProfessionalDocs.length"
            :data="globalProfessionalDocs"
          />
        </template>
      </UCard>

      <!-- Local Professionals -->
      <UCard v-if="hasLocalProfessionalCollection">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-base font-semibold">Local Professionals</h2>
            <UBadge variant="soft">{{ localProfessionalCount }} total</UBadge>
          </div>
          <p class="text-sm opacity-70">
            Tenant-scoped overrides for the professionals collection.
          </p>
        </template>

        <div
          v-if="localProfessionalPills.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OrganismsProfilesProfessionalCardsPill
            v-for="pill in localProfessionalPills"
            :key="professionalPillKey(pill)"
            :professional="pill"
          />
        </div>

        <p v-else class="text-sm opacity-70">No local professionals found.</p>

        <template #footer>
          <DevJsonPanel
            v-if="localProfessionalDocs.length"
            :data="localProfessionalDocs"
          />
        </template>
      </UCard>
      <UCard v-else>
        <template #header>
          <h2 class="text-base font-semibold">Local Professionals</h2>
        </template>
        <p class="text-sm opacity-70">
          Local (tenant) collection unavailable in this environment.
        </p>
      </UCard>

      <!-- Global Employers -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-base font-semibold">Global Employers</h2>
            <UBadge variant="soft">{{ globalEmployerCount }} total</UBadge>
          </div>
          <p class="text-sm opacity-70">
            Profiles resolved from the global employers collection.
          </p>
        </template>

        <div
          v-if="globalEmployerPills.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OrganismsProfilesEmployerCardsPill
            v-for="pill in globalEmployerPills"
            :key="employerPillKey(pill)"
            :employer="pill"
          />
        </div>

        <p v-else class="text-sm opacity-70">No global employers found.</p>

        <template #footer>
          <DevJsonPanel
            v-if="globalEmployerDocs.length"
            :data="globalEmployerDocs"
          />
        </template>
      </UCard>

      <!-- Local Employers -->
      <UCard v-if="hasLocalEmployerCollection">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-base font-semibold">Local Employers</h2>
            <UBadge variant="soft">{{ localEmployerCount }} total</UBadge>
          </div>
          <p class="text-sm opacity-70">
            Tenant-scoped overrides for the employers collection.
          </p>
        </template>

        <div
          v-if="localEmployerPills.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OrganismsProfilesEmployerCardsPill
            v-for="pill in localEmployerPills"
            :key="employerPillKey(pill)"
            :employer="pill"
          />
        </div>

        <p v-else class="text-sm opacity-70">No local employers found.</p>

        <template #footer>
          <DevJsonPanel
            v-if="localEmployerDocs.length"
            :data="localEmployerDocs"
          />
        </template>
      </UCard>
      <UCard v-else>
        <template #header>
          <h2 class="text-base font-semibold">Local Employers</h2>
        </template>
        <p class="text-sm opacity-70">
          Local (tenant) collection unavailable in this environment.
        </p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void

import { computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile'
import {
  professionalConfig,
  type ProfessionalProfile,
  type ProfessionalCard,
} from '../../models/profiles/Professional.model'
import {
  employerConfig,
  type EmployerProfile,
  type EmployerCard,
} from '../../models/profiles/Employer.model'
import { useProfessionalCollection } from '../../composables/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import {
  resolveProfessionalPill,
  resolveProfessionalPillKey,
} from '../../composables/firestore/profiles/Professional/main/useProfessionalInterface.ts'
import { useEmployerCollection } from '../../composables/firestore/profiles/Employer/main/useEmployerCollection.ts'
import { formatFirestoreTimestamp } from 'fireux-core/runtime/utils/formatTimestamp.ts'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-jobs'],
  nav: {
    key: 'dev-ext-jobs',
    label: 'Jobs (Ext)',
    icon: 'i-lucide-briefcase',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const { profile: professional } =
  useProfile<ProfessionalProfile>(professionalConfig)
const { profile: employer } = useProfile<EmployerProfile>(employerConfig)

const {
  globalProfessionals,
  localProfessionals,
  rawGlobalProfessionals,
  rawLocalProfessionals,
} = useProfessionalCollection()

const {
  globalEmployers,
  localEmployers,
  rawGlobalEmployers,
  rawLocalEmployers,
} = useEmployerCollection()

const professionalPillKey = resolveProfessionalPillKey

const firstGlobalProfessional = computed<ProfessionalProfile | null>(() => {
  const docs = rawGlobalProfessionals.value
  if (Array.isArray(docs) && docs.length > 0) {
    return docs[0] as ProfessionalProfile
  }
  return null
})

const activeProfessionalProfile = computed<ProfessionalProfile | null>(() => {
  return professional.value ?? firstGlobalProfessional.value ?? null
})

const firstGlobalEmployer = computed<EmployerProfile | null>(() => {
  const docs = rawGlobalEmployers.value
  if (Array.isArray(docs) && docs.length > 0) {
    return docs[0] as EmployerProfile
  }
  return null
})

const activeEmployerProfile = computed<EmployerProfile | null>(() => {
  return employer.value ?? firstGlobalEmployer.value ?? null
})

const professionalPill = computed<ProfessionalCard.Pill | null>(() => {
  const value = activeProfessionalProfile.value
  if (!value) return null

  const pill = resolveProfessionalPill(value)
  return {
    ...pill,
    to: value.id ? `/professionals/${value.id}` : pill.to,
  }
})

const professionalMeta = computed(() => {
  const value = activeProfessionalProfile.value
  if (!value) return null

  const ensure = (input?: string | null) => (input && input.trim()) || null

  return {
    id: value.id ?? '—',
    title: ensure(value.title) ?? ensure(value.display_name) ?? '—',
    subtitle: ensure(value.subtitle) ?? '—',
    displayName: ensure(value.display_name) ?? '—',
    updatedAt:
      formatFirestoreTimestamp(value.updated_at, {
        fallback: 'Never updated',
        format: { dateStyle: 'medium', timeStyle: 'short' },
      }) ?? 'Never updated',
  }
})

const globalProfessionalPills = computed<ProfessionalCard.Pill[]>(() =>
  (globalProfessionals.value ?? []).map((profile) =>
    resolveProfessionalPill(profile)
  )
)

const localProfessionalPills = computed<ProfessionalCard.Pill[]>(() => {
  if (!localProfessionals) return []
  return (localProfessionals.value ?? []).map((profile) =>
    resolveProfessionalPill(profile)
  )
})

const globalProfessionalCount = computed(
  () => globalProfessionalPills.value.length
)

const localProfessionalCount = computed(
  () => localProfessionalPills.value.length
)

const globalProfessionalDocs = computed(
  () => rawGlobalProfessionals.value ?? []
)

const localProfessionalDocs = computed(() =>
  rawLocalProfessionals ? rawLocalProfessionals.value ?? [] : []
)

const hasLocalProfessionalCollection = computed(() =>
  Boolean(localProfessionals)
)

const toEmployerPill = (
  profile?: Partial<EmployerProfile> | null
): EmployerCard.Pill => {
  const title = (profile?.title || profile?.organization_name || '').trim()
  const normalizedTitle = title || 'Employer'
  const subtitle = profile?.subtitle ?? ''
  const avatar = profile?.avatar_url || profile?.avatar || ''
  const rawBadges = profile?.badges
  const badges = Array.isArray(rawBadges) ? rawBadges : []
  const to = profile?.id ? `/employers/${profile.id}` : null

  return {
    avatar,
    title: normalizedTitle,
    subtitle,
    badges,
    to,
  }
}

const employerPillKey = (pill: EmployerCard.Pill) =>
  pill.to ?? pill.title ?? 'employer'

const employerPill = computed<EmployerCard.Pill | null>(() => {
  const value = activeEmployerProfile.value
  if (!value) return null

  const pill = toEmployerPill(value)
  return {
    ...pill,
    to: value.id ? `/employers/${value.id}` : pill.to,
  }
})

const employerMeta = computed(() => {
  const value = activeEmployerProfile.value
  if (!value) return null

  const ensure = (input?: string | null) => (input && input.trim()) || null

  return {
    id: value.id ?? '—',
    title: ensure(value.title) ?? ensure(value.organization_name) ?? '—',
    subtitle: ensure(value.subtitle) ?? '—',
    displayName: ensure(value.display_name) ?? '—',
    updatedAt:
      formatFirestoreTimestamp(value.updated_at, {
        fallback: 'Never updated',
        format: { dateStyle: 'medium', timeStyle: 'short' },
      }) ?? 'Never updated',
  }
})

const globalEmployerPills = computed<EmployerCard.Pill[]>(() =>
  (globalEmployers.value ?? []).map((profile) => toEmployerPill(profile))
)

const localEmployerPills = computed<EmployerCard.Pill[]>(() => {
  if (!localEmployers) return []
  return (localEmployers.value ?? []).map((profile) => toEmployerPill(profile))
})

const globalEmployerCount = computed(() => globalEmployerPills.value.length)

const localEmployerCount = computed(() => localEmployerPills.value.length)

const globalEmployerDocs = computed(() => rawGlobalEmployers.value ?? [])

const localEmployerDocs = computed(() =>
  rawLocalEmployers ? rawLocalEmployers.value ?? [] : []
)

const hasLocalEmployerCollection = computed(() => Boolean(localEmployers))
</script>

<style scoped>
.current-entity {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .current-entity {
    grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
    align-items: start;
  }
}

.meta-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.meta-grid dt {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-400, rgba(148, 163, 184, 0.9));
}

.meta-grid dd {
  margin: 0.15rem 0 0;
  font-weight: 600;
  color: var(--ui-text-900, rgba(15, 23, 42, 0.95));
}
</style>
