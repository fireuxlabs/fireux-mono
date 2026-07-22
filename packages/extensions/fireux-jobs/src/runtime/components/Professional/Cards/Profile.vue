<!-- Concurrent edit — 2026-07-20 20:03 CEST — Repo Efficiency Pass 2 of 6: render projected Professional detail with canonical Place enrichment. -->
<!-- Concurrent edit — 2026-07-21 12:58 CEST — CSS architecture pass: use the shared semantic type role outside form composition. -->
<!-- Concurrent edit — 2026-07-22 16:18 CEST — Public profile presentation: render the Professional projection as an SSR-visible portfolio. -->
<template>
  <article v-if="viewModel" class="mx-auto w-full max-w-6xl space-y-6">
    <PublicProfileHero
      kind-label="Professional"
      icon="i-lucide-briefcase-business"
      :avatar-url="profileImage"
      :display-name="
        viewModel.identityCard.displayName || 'Professional profile'
      "
      :handle="viewModel.identityCard.handle"
      :subtitle="viewModel.subtitle"
      :title="viewModel.identityCard.title"
      :summary="heroSummary"
      :tagline="viewModel.tagline"
      :labels="profileLabels"
      :stats="profileStats"
    >
      <template #actions>
        <slot name="actions" />
      </template>
    </PublicProfileHero>

    <div class="professional-profile__content-grid grid items-start gap-6">
      <div class="space-y-6">
        <section
          v-if="aboutCopy"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm sm:p-7"
        >
          <PublicProfileSectionHeading
            icon="i-lucide-user-round"
            eyebrow="Profile"
            title="About"
          />
          <p
            class="mt-5 whitespace-pre-line text-sm leading-7 text-toned sm:text-base"
          >
            {{ aboutCopy }}
          </p>
        </section>

        <section
          class="rounded-3xl border border-default bg-default p-5 shadow-sm sm:p-7"
        >
          <div class="flex flex-wrap items-end justify-between gap-3">
            <PublicProfileSectionHeading
              icon="i-lucide-briefcase-business"
              eyebrow="Career"
              title="Experience"
            />
            <UBadge
              :label="`${experienceCount} ${experienceCount === 1 ? 'role' : 'roles'}`"
              color="neutral"
              variant="soft"
            />
          </div>

          <div v-if="experienceCount" class="mt-7 space-y-8">
            <div
              v-for="(entry, index) in viewModel.relevantExperience"
              :key="`relevant-${entry.item.place_id}-${entry.item.role}-${index}`"
              class="relative pl-8"
            >
              <div
                v-if="index < viewModel.relevantExperience.length - 1"
                class="absolute left-[0.4375rem] top-3 h-[calc(100%+2rem)] w-px bg-default"
              />
              <div
                class="absolute left-0 top-2 flex size-4 items-center justify-center rounded-full border-4 border-default bg-primary ring-1 ring-primary/20"
              />

              <div
                class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
              >
                <h3 class="font-semibold text-highlighted">
                  {{ entry.item.role || 'Professional role' }}
                </h3>
                <span class="shrink-0 text-xs font-medium text-muted">
                  {{ formatExperienceDates(entry.item) || 'Dates not listed' }}
                </span>
              </div>

              <div class="mt-3">
                <PlaceCardsPill
                  v-if="entry.placeCard"
                  v-bind="entry.placeCard"
                  :show-badges="false"
                />
                <div
                  v-else
                  class="inline-flex items-center gap-2 rounded-lg bg-elevated px-2.5 py-1.5 text-xs text-muted"
                >
                  <UIcon name="i-lucide-map-pin" class="size-3.5" />
                  Workplace details unavailable
                </div>
              </div>

              <p
                v-if="entry.item.responsibilities"
                class="mt-3 whitespace-pre-line text-sm leading-6 text-toned"
              >
                {{ entry.item.responsibilities }}
              </p>
            </div>

            <div
              v-if="viewModel.otherExperience.length"
              class="border-t border-default pt-7"
            >
              <p class="fx-type-label mb-5">Additional experience</p>
              <div class="space-y-6">
                <div
                  v-for="(entry, index) in viewModel.otherExperience"
                  :key="`other-${entry.item.place_id}-${entry.item.role}-${index}`"
                  class="rounded-2xl bg-elevated/60 p-4"
                >
                  <div
                    class="flex flex-col gap-1 sm:flex-row sm:justify-between"
                  >
                    <h3 class="font-semibold text-highlighted">
                      {{ entry.item.role || 'Professional role' }}
                    </h3>
                    <span class="text-xs font-medium text-muted">
                      {{
                        formatExperienceDates(entry.item) || 'Dates not listed'
                      }}
                    </span>
                  </div>
                  <div class="mt-3">
                    <PlaceCardsPill
                      v-if="entry.placeCard"
                      v-bind="entry.placeCard"
                      :show-badges="false"
                    />
                    <div
                      v-else
                      class="inline-flex items-center gap-2 text-xs text-muted"
                    >
                      <UIcon name="i-lucide-map-pin" class="size-3.5" />
                      Workplace details unavailable
                    </div>
                  </div>
                  <p
                    v-if="entry.item.responsibilities"
                    class="mt-3 whitespace-pre-line text-sm leading-6 text-toned"
                  >
                    {{ entry.item.responsibilities }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="mt-5 text-sm text-muted">
            No experience listed yet.
          </p>
        </section>

        <section
          v-if="viewModel.projects.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm sm:p-7"
        >
          <PublicProfileSectionHeading
            icon="i-lucide-blocks"
            eyebrow="Selected work"
            title="Projects"
          />
          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <article
              v-for="project in viewModel.projects"
              :key="`${project.name}-${project.role}`"
              class="rounded-2xl border border-default bg-elevated/45 p-4"
            >
              <h3 class="font-semibold text-highlighted">{{ project.name }}</h3>
              <p class="mt-1 text-xs font-medium text-primary">
                {{ project.role }} ·
                {{
                  formatRange(
                    project.from_year,
                    project.to_year,
                    project.ongoing
                  )
                }}
              </p>
              <p
                v-if="project.responsibilities"
                class="mt-3 whitespace-pre-line text-sm leading-6 text-toned"
              >
                {{ project.responsibilities }}
              </p>
            </article>
          </div>
        </section>
      </div>

      <aside class="professional-profile__sidebar space-y-4">
        <section
          v-if="viewModel.languages.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm"
        >
          <PublicProfileSectionHeading
            icon="i-lucide-languages"
            eyebrow="Communication"
            title="Languages"
            compact
          />
          <div class="mt-5 space-y-3">
            <div
              v-for="language in viewModel.languages"
              :key="`${language.language}-${language.proficiency}`"
              class="flex items-center justify-between gap-3"
            >
              <span class="text-sm font-medium text-highlighted">{{
                language.language
              }}</span>
              <UBadge
                v-if="language.proficiency"
                :label="language.proficiency"
                color="neutral"
                variant="soft"
                size="xs"
              />
            </div>
          </div>
        </section>

        <section
          v-if="viewModel.certifications.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm"
        >
          <PublicProfileSectionHeading
            icon="i-lucide-award"
            eyebrow="Verified learning"
            title="Certifications"
            compact
          />
          <div class="mt-5 space-y-5">
            <article
              v-for="cert in viewModel.certifications"
              :key="`${cert.name}-${cert.year}`"
            >
              <h3 class="text-sm font-semibold text-highlighted">
                {{ cert.name }}
              </h3>
              <p class="mt-1 text-xs leading-5 text-muted">
                {{
                  [cert.place_name, cert.year].filter(Boolean).join(' · ') ||
                  'Details not listed'
                }}
              </p>
              <p v-if="cert.formatted_address" class="mt-1 text-xs text-dimmed">
                {{ cert.formatted_address }}
              </p>
              <a
                v-if="cert.document_url"
                :href="cert.document_url"
                target="_blank"
                rel="noreferrer"
                class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View credential
                <UIcon name="i-lucide-external-link" class="size-3" />
              </a>
            </article>
          </div>
        </section>

        <section
          v-if="viewModel.education.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm"
        >
          <PublicProfileSectionHeading
            icon="i-lucide-graduation-cap"
            eyebrow="Training"
            title="Education"
            compact
          />
          <div class="mt-5 space-y-5">
            <article
              v-for="entry in viewModel.education"
              :key="`${entry.institution}-${entry.degree}`"
            >
              <h3 class="text-sm font-semibold text-highlighted">
                {{ entry.degree }}
              </h3>
              <p class="mt-1 text-xs leading-5 text-muted">
                {{ entry.institution }} ·
                {{
                  formatRange(entry.start_year, entry.end_year, entry.ongoing)
                }}
              </p>
              <p
                v-if="entry.formatted_address"
                class="mt-1 text-xs text-dimmed"
              >
                {{ entry.formatted_address }}
              </p>
              <a
                v-if="entry.document_url"
                :href="entry.document_url"
                target="_blank"
                rel="noreferrer"
                class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View document
                <UIcon name="i-lucide-external-link" class="size-3" />
              </a>
            </article>
          </div>
        </section>

        <section
          v-if="viewModel.volunteering.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm"
        >
          <PublicProfileSectionHeading
            icon="i-lucide-heart-handshake"
            eyebrow="Community"
            title="Volunteering"
            compact
          />
          <div class="mt-5 space-y-5">
            <article
              v-for="entry in viewModel.volunteering"
              :key="`${entry.organization}-${entry.role}`"
            >
              <h3 class="text-sm font-semibold text-highlighted">
                {{ entry.organization }}
              </h3>
              <p class="mt-1 text-xs leading-5 text-muted">
                {{ entry.role }} ·
                {{ formatRange(entry.from_year, entry.to_year, entry.ongoing) }}
              </p>
              <p
                v-if="entry.responsibilities"
                class="mt-2 whitespace-pre-line text-xs leading-5 text-toned"
              >
                {{ entry.responsibilities }}
              </p>
            </article>
          </div>
        </section>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfessionalCard } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import type { ProfessionalProfileViewModel } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalProfileView'
import type { PublicProfessionalProfile } from '../../../models/profiles/Professional/Professional.model'

const props = defineProps<{
  model?: ProfessionalProfileViewModel | null
  card?: ProfessionalCard.Card
  profile?: PublicProfessionalProfile | null
  prop?: string
}>()

const viewModel = computed<ProfessionalProfileViewModel | null>(() => {
  if (props.model) return props.model
  if (!props.card || !props.profile) return null

  return {
    identityCard: props.card,
    prop: String(props.prop ?? '').trim(),
    subtitle: String(props.profile.subtitle ?? '').trim(),
    tagline: String(props.profile.tagline ?? '').trim(),
    positions: props.profile.positions ?? [],
    summary: String(props.profile.summary ?? '').trim(),
    bio: String(props.profile.bio ?? '').trim(),
    relevantExperience: (props.profile.relevant_experience ?? []).map(
      (item) => ({
        item,
        placeCard: null,
      })
    ),
    otherExperience: (props.profile.other_experience ?? []).map((item) => ({
      item,
      placeCard: null,
    })),
    languages: props.profile.languages ?? [],
    certifications: props.profile.certifications ?? [],
    education: props.profile.education ?? [],
    volunteering: props.profile.volunteering ?? [],
    projects: props.profile.projects ?? [],
    accordionItems: [
      props.profile.summary?.trim()
        ? { label: 'Summary', value: 'summary' }
        : null,
      props.profile.bio?.trim() ? { label: 'Bio', value: 'bio' } : null,
      props.profile.relevant_experience?.length ||
      props.profile.other_experience?.length
        ? {
            label: 'Relevant Experience',
            value: 'relevant_experience',
          }
        : null,
      props.profile.languages?.length
        ? { label: 'Languages', value: 'languages' }
        : null,
      props.profile.certifications?.length
        ? { label: 'Certifications', value: 'certifications' }
        : null,
      props.profile.education?.length
        ? { label: 'Education', value: 'education' }
        : null,
      props.profile.volunteering?.length
        ? { label: 'Volunteering', value: 'volunteering' }
        : null,
      props.profile.projects?.length
        ? { label: 'Projects', value: 'projects' }
        : null,
    ].filter(Boolean) as ProfessionalProfileViewModel['accordionItems'],
  }
})

const profileImage = computed(() => {
  const model = viewModel.value
  return (
    model?.identityCard.image ||
    model?.identityCard.imageUrl ||
    model?.identityCard.avatarUrl ||
    ''
  )
})

const heroSummary = computed(() => {
  const model = viewModel.value
  return String(
    model?.prop || model?.summary || model?.identityCard.summary || ''
  ).trim()
})

const aboutCopy = computed(() => {
  const model = viewModel.value
  const bio = String(model?.bio || '').trim()
  return bio && bio !== heroSummary.value ? bio : ''
})

const profileLabels = computed(() => {
  const model = viewModel.value
  if (!model) return []

  return Array.from(
    new Set(
      [...model.positions, ...model.identityCard.badges]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  )
})

const experienceCount = computed(() => {
  const model = viewModel.value
  return (
    (model?.relevantExperience.length ?? 0) +
    (model?.otherExperience.length ?? 0)
  )
})

const profileStats = computed(() => {
  const model = viewModel.value
  return [
    {
      label: 'Experience',
      value: experienceCount.value,
      icon: 'i-lucide-briefcase-business',
    },
    {
      label: 'Languages',
      value: model?.languages.length ?? 0,
      icon: 'i-lucide-languages',
    },
    {
      label: 'Credentials',
      value:
        (model?.certifications.length ?? 0) + (model?.education.length ?? 0),
      icon: 'i-lucide-award',
    },
  ]
})

const formatExperienceDates = (item: {
  from_month?: string
  from_year?: string
  to_month?: string
  to_year?: string
  ongoing?: boolean
}) => {
  const start = [item.from_month, item.from_year].filter(Boolean).join(' ')
  const end = item.ongoing
    ? 'Present'
    : [item.to_month, item.to_year].filter(Boolean).join(' ')
  return [start, end].filter(Boolean).join(' · ')
}

const formatRange = (
  from?: string | number | null,
  to?: string | number | null,
  ongoing?: boolean
) => {
  const start = from != null && String(from).trim() ? String(from) : ''
  const end = ongoing
    ? 'Present'
    : to != null && String(to).trim()
      ? String(to)
      : ''
  return [start, end].filter(Boolean).join(' · ') || 'Dates not listed'
}
</script>

<style scoped>
.professional-profile__content-grid {
  gap: calc(var(--spacing) * 6);
}

@media (min-width: 64rem) {
  .professional-profile__content-grid {
    grid-template-columns: minmax(0, 1fr) calc(var(--spacing) * 80);
  }

  .professional-profile__sidebar {
    position: sticky;
    top: calc(var(--spacing) * 24);
  }
}
</style>
