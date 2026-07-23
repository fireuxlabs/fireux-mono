<!-- Concurrent edit — 2026-07-20 20:03 CEST — Repo Efficiency Pass 2 of 6: render projected Professional detail with canonical Place enrichment. -->
<!-- Concurrent edit — 2026-07-21 12:58 CEST — CSS architecture pass: use the shared semantic type role outside form composition. -->
<!-- Concurrent edit — 2026-07-22 16:18 CEST — Public profile presentation: render the Professional projection as an SSR-visible portfolio. -->
<!-- Concurrent edit — 2026-07-22 18:10 CEST — Professional portfolio pass: lead with current work, evidence, and an editorial career story. -->
<template>
  <article
    v-if="viewModel"
    class="public-profile-detail"
    data-profile-tone="professional"
  >
    <PublicProfileHero
      kind-label="Professional"
      icon="i-lucide-briefcase-business"
      tone="primary"
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
      <template #media="{ imageUrl, displayName, icon }">
        <div class="professional-profile__portrait">
          <img
            v-if="imageUrl && !portraitImageFailed"
            :src="imageUrl"
            :alt="displayName"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            @error="portraitImageFailed = true"
          />
          <UIcon v-else :name="icon" aria-hidden="true" />
        </div>
      </template>

      <template #badges>
        <UBadge
          v-if="activeExperienceCount"
          :label="`${activeExperienceCount} active ${activeExperienceCount === 1 ? 'role' : 'roles'}`"
          icon="i-lucide-radio"
          color="success"
          variant="soft"
        />
      </template>

      <template #actions>
        <slot name="actions" />
      </template>
    </PublicProfileHero>

    <nav
      v-if="sectionLinks.length > 1"
      class="professional-profile__navigator"
      aria-label="Professional profile sections"
    >
      <span class="professional-profile__navigator-label">Portfolio</span>
      <div class="professional-profile__navigator-links">
        <a
          v-for="link in sectionLinks"
          :key="link.to"
          :href="link.to"
          class="professional-profile__navigator-link"
        >
          {{ link.label }}
        </a>
      </div>
    </nav>

    <div class="public-profile-detail__content">
      <div class="public-profile-detail__main">
        <PublicProfileSection
          v-if="aboutCopy"
          id="about"
          icon="i-lucide-user-round"
          eyebrow="Profile"
          title="About"
        >
          <p
            class="whitespace-pre-line text-sm leading-7 text-toned sm:text-base"
          >
            {{ aboutCopy }}
          </p>
        </PublicProfileSection>

        <PublicProfileSection
          v-if="leadProject"
          id="featured-work"
          icon="i-lucide-sparkles"
          eyebrow="Selected work"
          title="Project focus"
        >
          <article class="professional-profile__spotlight">
            <div class="professional-profile__spotlight-heading">
              <div>
                <p class="fx-type-label">
                  {{ leadProject.ongoing ? 'Current project' : 'Project' }}
                </p>
                <h3 class="professional-profile__spotlight-title">
                  {{ leadProject.name }}
                </h3>
              </div>
              <UBadge
                :label="leadProject.ongoing ? 'Ongoing' : 'Completed'"
                :icon="
                  leadProject.ongoing ? 'i-lucide-radio' : 'i-lucide-check'
                "
                :color="leadProject.ongoing ? 'success' : 'primary'"
                variant="soft"
              />
            </div>

            <p
              v-if="leadProject.responsibilities"
              class="professional-profile__spotlight-copy"
            >
              {{ leadProject.responsibilities }}
            </p>

            <dl class="professional-profile__spotlight-meta">
              <div>
                <dt>Contribution</dt>
                <dd>{{ leadProject.role || 'Project contributor' }}</dd>
              </div>
              <div>
                <dt>Timeline</dt>
                <dd>
                  {{
                    formatRange(
                      leadProject.from_year,
                      leadProject.to_year,
                      leadProject.ongoing
                    )
                  }}
                </dd>
              </div>
            </dl>
          </article>

          <div
            v-if="additionalProjects.length"
            class="professional-profile__project-grid"
          >
            <article
              v-for="project in additionalProjects"
              :key="`${project.name}-${project.role}`"
              class="professional-profile__project-card"
            >
              <h3 class="font-semibold text-highlighted">
                {{ project.name }}
              </h3>
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
        </PublicProfileSection>

        <PublicProfileSection
          v-if="currentRelevantExperience.length"
          id="current-chapter"
          icon="i-lucide-zap"
          eyebrow="Now"
          title="Current chapter"
        >
          <template #meta>
            <UBadge
              :label="`${currentRelevantExperience.length} active`"
              icon="i-lucide-radio"
              color="success"
              variant="soft"
            />
          </template>

          <div class="professional-profile__current-grid">
            <article
              v-for="(entry, index) in currentRelevantExperience"
              :key="`current-${entry.item.place_id}-${entry.item.role}-${index}`"
              class="professional-profile__current-role"
            >
              <div class="professional-profile__role-heading">
                <h3>{{ entry.item.role || 'Professional role' }}</h3>
                <span v-if="formatExperienceDates(entry.item)">
                  {{ formatExperienceDates(entry.item) }}
                </span>
              </div>

              <div v-if="entry.placeCard" class="mt-3">
                <PlaceCardsPill v-bind="entry.placeCard" :show-badges="false" />
              </div>

              <p
                v-if="entry.item.responsibilities"
                class="mt-4 whitespace-pre-line text-sm leading-6 text-toned"
              >
                {{ entry.item.responsibilities }}
              </p>
            </article>
          </div>
        </PublicProfileSection>

        <PublicProfileSection
          v-if="pastRelevantExperience.length"
          id="career-history"
          icon="i-lucide-route"
          eyebrow="Career"
          title="Career history"
        >
          <template #meta>
            <UBadge
              :label="`${pastRelevantExperience.length} ${pastRelevantExperience.length === 1 ? 'role' : 'roles'}`"
              color="neutral"
              variant="soft"
            />
          </template>

          <ol class="professional-profile__timeline">
            <li
              v-for="(entry, index) in pastRelevantExperience"
              :key="`past-${entry.item.place_id}-${entry.item.role}-${index}`"
              class="professional-profile__timeline-item"
            >
              <div class="professional-profile__timeline-marker" />
              <div class="professional-profile__role-heading">
                <h3>{{ entry.item.role || 'Professional role' }}</h3>
                <span v-if="formatExperienceDates(entry.item)">
                  {{ formatExperienceDates(entry.item) }}
                </span>
              </div>

              <div v-if="entry.placeCard" class="mt-3">
                <PlaceCardsPill v-bind="entry.placeCard" :show-badges="false" />
              </div>

              <p
                v-if="entry.item.responsibilities"
                class="mt-3 whitespace-pre-line text-sm leading-6 text-toned"
              >
                {{ entry.item.responsibilities }}
              </p>
            </li>
          </ol>
        </PublicProfileSection>

        <PublicProfileSection
          v-if="sortedOtherExperience.length"
          id="additional-expertise"
          icon="i-lucide-layers-3"
          eyebrow="Beyond the headline"
          title="Additional expertise"
        >
          <div class="professional-profile__expertise-grid">
            <article
              v-for="(entry, index) in sortedOtherExperience"
              :key="`other-${entry.item.place_id}-${entry.item.role}-${index}`"
              class="professional-profile__expertise-card"
            >
              <div class="professional-profile__role-heading">
                <div class="flex flex-wrap items-center gap-2">
                  <h3>{{ entry.item.role || 'Professional role' }}</h3>
                  <UBadge
                    v-if="entry.item.ongoing"
                    label="Active"
                    color="success"
                    variant="soft"
                    size="xs"
                  />
                </div>
                <span v-if="formatExperienceDates(entry.item)">
                  {{ formatExperienceDates(entry.item) }}
                </span>
              </div>

              <div v-if="entry.placeCard" class="mt-3">
                <PlaceCardsPill v-bind="entry.placeCard" :show-badges="false" />
              </div>

              <p
                v-if="entry.item.responsibilities"
                class="mt-3 whitespace-pre-line text-sm leading-6 text-toned"
              >
                {{ entry.item.responsibilities }}
              </p>
            </article>
          </div>
        </PublicProfileSection>

        <PublicProfileSection
          v-if="viewModel.volunteering.length"
          id="community"
          icon="i-lucide-heart-handshake"
          eyebrow="Community"
          title="Volunteering"
        >
          <div class="professional-profile__community-grid">
            <article
              v-for="entry in viewModel.volunteering"
              :key="`${entry.organization}-${entry.role}`"
              class="professional-profile__community-card"
            >
              <div class="professional-profile__role-heading">
                <div>
                  <h3>{{ entry.organization }}</h3>
                  <p class="mt-1 text-sm font-medium text-primary">
                    {{ entry.role }}
                  </p>
                </div>
                <span>
                  {{
                    formatRange(entry.from_year, entry.to_year, entry.ongoing)
                  }}
                </span>
              </div>
              <p
                v-if="entry.responsibilities"
                class="mt-3 whitespace-pre-line text-sm leading-6 text-toned"
              >
                {{ entry.responsibilities }}
              </p>
            </article>
          </div>
        </PublicProfileSection>
      </div>

      <aside
        class="public-profile-detail__sidebar"
        aria-label="Professional evidence"
      >
        <PublicProfileSection
          v-if="viewModel.languages.length"
          compact
          icon="i-lucide-languages"
          eyebrow="Communication"
          title="Languages"
        >
          <div class="space-y-3">
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
                :label="formatProficiency(language.proficiency)"
                color="neutral"
                variant="soft"
                size="xs"
              />
            </div>
          </div>
        </PublicProfileSection>

        <PublicProfileSection
          v-if="viewModel.certifications.length"
          compact
          icon="i-lucide-award"
          eyebrow="Credentials"
          title="Certifications"
        >
          <div class="professional-profile__evidence-list">
            <article
              v-for="cert in viewModel.certifications"
              :key="`${cert.name}-${cert.year}`"
              class="professional-profile__evidence-item"
            >
              <h3 class="text-sm font-semibold text-highlighted">
                {{ cert.name }}
              </h3>
              <p
                v-if="[cert.place_name, cert.year].filter(Boolean).length"
                class="mt-1 text-xs leading-5 text-muted"
              >
                {{ [cert.place_name, cert.year].filter(Boolean).join(' · ') }}
              </p>
              <a
                v-if="cert.document_url"
                :href="cert.document_url"
                :aria-label="`View ${cert.name || 'certification'} credential`"
                target="_blank"
                rel="noreferrer"
                class="professional-profile__evidence-link"
              >
                View credential
                <UIcon name="i-lucide-external-link" class="size-3" />
              </a>
            </article>
          </div>
        </PublicProfileSection>

        <PublicProfileSection
          v-if="viewModel.education.length"
          compact
          icon="i-lucide-graduation-cap"
          eyebrow="Training"
          title="Education"
        >
          <div class="professional-profile__evidence-list">
            <article
              v-for="entry in viewModel.education"
              :key="`${entry.institution}-${entry.degree}`"
              class="professional-profile__evidence-item"
            >
              <h3 class="text-sm font-semibold text-highlighted">
                {{ entry.degree || 'Professional training' }}
              </h3>
              <p class="mt-1 text-xs leading-5 text-muted">
                {{ entry.institution }} ·
                {{
                  formatRange(entry.start_year, entry.end_year, entry.ongoing)
                }}
              </p>
              <a
                v-if="entry.document_url"
                :href="entry.document_url"
                :aria-label="`View ${entry.degree || 'education'} document`"
                target="_blank"
                rel="noreferrer"
                class="professional-profile__evidence-link"
              >
                View document
                <UIcon name="i-lucide-external-link" class="size-3" />
              </a>
            </article>
          </div>
        </PublicProfileSection>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProfessionalCard } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import type {
  ProfessionalProfileOtherExperience,
  ProfessionalProfileRelevantExperience,
  ProfessionalProfileViewModel,
} from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalProfileView'
import type { PublicProfessionalProfile } from '../../../models/profiles/Professional/Professional.model'
import type { ProjectItem } from '../../../models/profiles/Professional/supporting'

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
const portraitImageFailed = ref(false)
watch(profileImage, () => {
  portraitImageFailed.value = false
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

  const labels = Array.from(
    new Set(
      [...model.positions, ...model.identityCard.badges]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  )
  if (labels.length <= 6) return labels
  return [...labels.slice(0, 5), `+${labels.length - 5} more`]
})

const monthIndex = new Map(
  [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ].map((month, index) => [month, index + 1])
)

type ProfessionalExperienceEntry =
  | ProfessionalProfileRelevantExperience
  | ProfessionalProfileOtherExperience

const experienceStartValue = (entry: ProfessionalExperienceEntry) => {
  const year = Number.parseInt(String(entry.item.from_year || ''), 10)
  const month =
    monthIndex.get(
      String(entry.item.from_month || '')
        .trim()
        .slice(0, 3)
        .toLowerCase()
    ) ?? 0
  return (Number.isFinite(year) ? year : 0) * 100 + month
}

const sortExperience = <T extends ProfessionalExperienceEntry>(entries: T[]) =>
  [...entries].sort(
    (left, right) =>
      Number(right.item.ongoing) - Number(left.item.ongoing) ||
      experienceStartValue(right) - experienceStartValue(left)
  )

const sortedRelevantExperience = computed(() =>
  sortExperience(viewModel.value?.relevantExperience ?? [])
)
const currentRelevantExperience = computed(() =>
  sortedRelevantExperience.value.filter((entry) => entry.item.ongoing)
)
const pastRelevantExperience = computed(() =>
  sortedRelevantExperience.value.filter((entry) => !entry.item.ongoing)
)
const sortedOtherExperience = computed(() =>
  sortExperience(viewModel.value?.otherExperience ?? [])
)

const sortedProjects = computed(() =>
  [...(viewModel.value?.projects ?? [])].sort(
    (left, right) =>
      Number(right.ongoing) - Number(left.ongoing) ||
      Number(right.from_year || 0) - Number(left.from_year || 0)
  )
)
const leadProject = computed<ProjectItem | null>(
  () => sortedProjects.value[0] ?? null
)
const additionalProjects = computed(() => sortedProjects.value.slice(1))

const experienceCount = computed(() => {
  const model = viewModel.value
  return (
    (model?.relevantExperience.length ?? 0) +
    (model?.otherExperience.length ?? 0)
  )
})

const activeExperienceCount = computed(() => {
  const model = viewModel.value
  if (!model) return 0
  return [...model.relevantExperience, ...model.otherExperience].filter(
    (entry) => entry.item.ongoing
  ).length
})

const careerSpanYears = computed(() => {
  const model = viewModel.value
  if (!model) return 0

  const entries = [...model.relevantExperience, ...model.otherExperience]
  const currentYear = new Date().getUTCFullYear()
  const startYears = entries
    .map((entry) => Number.parseInt(String(entry.item.from_year || ''), 10))
    .filter((year) => Number.isFinite(year) && year > 0 && year <= currentYear)
  if (!startYears.length) return 0

  const endYears = entries
    .map((entry) => Number.parseInt(String(entry.item.to_year || ''), 10))
    .filter((year) => Number.isFinite(year) && year > 0 && year <= currentYear)
  const hasOngoingExperience = entries.some((entry) => entry.item.ongoing)
  const firstYear = Math.min(...startYears)
  const finalYears = [
    ...startYears,
    ...endYears,
    ...(hasOngoingExperience ? [currentYear] : []),
  ]
  const lastYear = Math.max(...finalYears)
  return Math.max(1, lastYear - firstYear)
})

const profileStats = computed(() => {
  const model = viewModel.value
  const stats: Array<{
    label: string
    value: number | string
    icon: string
  }> = []

  if (experienceCount.value) {
    stats.push({
      label: 'Roles',
      value: experienceCount.value,
      icon: 'i-lucide-briefcase-business',
    })
  }
  if (careerSpanYears.value) {
    stats.push({
      label: 'Career span',
      value: `${careerSpanYears.value} yrs`,
      icon: 'i-lucide-trending-up',
    })
  }

  const credentialCount =
    (model?.certifications.length ?? 0) + (model?.education.length ?? 0)
  if (credentialCount) {
    stats.push({
      label: 'Credentials',
      value: credentialCount,
      icon: 'i-lucide-award',
    })
  }

  return stats
})

const sectionLinks = computed(() => {
  const links: Array<{ label: string; to: string }> = []
  if (aboutCopy.value) links.push({ label: 'About', to: '#about' })
  if (leadProject.value) {
    links.push({ label: 'Projects', to: '#featured-work' })
  }
  if (currentRelevantExperience.value.length) {
    links.push({ label: 'Current', to: '#current-chapter' })
  }
  if (pastRelevantExperience.value.length) {
    links.push({ label: 'History', to: '#career-history' })
  }
  if (sortedOtherExperience.value.length) {
    links.push({ label: 'Expertise', to: '#additional-expertise' })
  }
  if (viewModel.value?.volunteering.length) {
    links.push({ label: 'Community', to: '#community' })
  }
  return links
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
  return [start, end].filter(Boolean).join(' — ')
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
  return [start, end].filter(Boolean).join(' — ') || 'Dates not listed'
}

const formatProficiency = (proficiency: string) => {
  const value = String(proficiency || '').trim()
  return /^[a-c][12]$/i.test(value) ? value.toUpperCase() : value
}
</script>

<style scoped>
.professional-profile__portrait {
  align-items: center;
  background: var(--ui-bg-elevated);
  border: 1px solid
    color-mix(
      in srgb,
      var(--fx-profile-accent, var(--ui-primary)) 32%,
      var(--ui-border)
    );
  border-radius: calc(var(--ui-radius) * 3);
  box-shadow:
    0 calc(var(--spacing) * 5) calc(var(--spacing) * 12)
      color-mix(in srgb, var(--ui-bg-inverted) 24%, transparent),
    inset 0 0 0 1px color-mix(in srgb, var(--ui-bg) 45%, transparent);
  color: var(--ui-text-muted);
  display: flex;
  height: calc(var(--spacing) * 40);
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: calc(var(--spacing) * 32);
}

.professional-profile__portrait::after {
  background: linear-gradient(
    180deg,
    transparent 58%,
    color-mix(in srgb, var(--ui-bg-inverted) 24%, transparent)
  );
  content: '';
  inset: 0;
  pointer-events: none;
  position: absolute;
}

.professional-profile__portrait img {
  height: 100%;
  object-fit: cover;
  object-position: center 28%;
  width: 100%;
}

.professional-profile__portrait > :not(img) {
  height: calc(var(--spacing) * 10);
  width: calc(var(--spacing) * 10);
}

.professional-profile__navigator {
  align-items: center;
  background: color-mix(in srgb, var(--ui-bg-elevated) 82%, transparent);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  display: flex;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
  padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 3);
}

.professional-profile__navigator-label {
  color: var(--ui-text-dimmed);
  flex: none;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wider);
  padding-left: var(--spacing);
  text-transform: uppercase;
}

.professional-profile__navigator-links {
  display: flex;
  gap: var(--spacing);
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.professional-profile__navigator-links::-webkit-scrollbar {
  display: none;
}

.professional-profile__navigator-link {
  border-radius: calc(var(--ui-radius) * 1.5);
  color: var(--ui-text-muted);
  flex: none;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.professional-profile__navigator-link:hover {
  background: var(--ui-bg-accented);
  color: var(--ui-text-highlighted);
}

.professional-profile__navigator-link:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

.professional-profile__spotlight {
  background:
    radial-gradient(
      circle at 100% 0,
      color-mix(in srgb, var(--ui-primary) 18%, transparent),
      transparent 42%
    ),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-primary) 9%, var(--ui-bg-elevated)),
      color-mix(in srgb, var(--ui-bg) 94%, transparent)
    );
  border: 1px solid color-mix(in srgb, var(--ui-primary) 28%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 3);
  overflow: hidden;
  padding: calc(var(--spacing) * 5);
  position: relative;
}

.professional-profile__spotlight-heading,
.professional-profile__role-heading {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
  justify-content: space-between;
}

.professional-profile__spotlight-title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--text-2xl--line-height);
  margin-top: var(--spacing);
  text-wrap: pretty;
}

.professional-profile__spotlight-copy {
  color: var(--ui-text-toned);
  font-size: var(--text-base);
  line-height: calc(var(--spacing) * 7);
  margin-top: calc(var(--spacing) * 5);
  max-width: calc(var(--spacing) * 176);
  white-space: pre-line;
}

.professional-profile__spotlight-meta {
  display: grid;
  gap: calc(var(--spacing) * 3);
  margin-top: calc(var(--spacing) * 6);
}

.professional-profile__spotlight-meta > div {
  background: color-mix(in srgb, var(--ui-bg) 72%, transparent);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 1.5);
  padding: calc(var(--spacing) * 3);
}

.professional-profile__spotlight-meta dt {
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.professional-profile__spotlight-meta dd {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing);
}

.professional-profile__project-grid,
.professional-profile__current-grid,
.professional-profile__expertise-grid,
.professional-profile__community-grid {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.professional-profile__project-grid {
  margin-top: calc(var(--spacing) * 3);
}

.professional-profile__project-card,
.professional-profile__expertise-card,
.professional-profile__community-card {
  background: color-mix(in srgb, var(--ui-bg-elevated) 56%, transparent);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  padding: calc(var(--spacing) * 4);
}

.professional-profile__current-role {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--ui-success) 7%, var(--ui-bg-elevated)),
    color-mix(in srgb, var(--ui-bg) 94%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--ui-success) 24%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 2);
  padding: calc(var(--spacing) * 5);
  position: relative;
}

.professional-profile__current-role::before {
  background: var(--ui-success);
  border-radius: 9999px;
  content: '';
  height: calc(var(--spacing) * 1.5);
  position: absolute;
  right: calc(var(--spacing) * 4);
  top: calc(var(--spacing) * 4);
  width: calc(var(--spacing) * 1.5);
}

.professional-profile__role-heading h3 {
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--text-base--line-height);
  padding-right: calc(var(--spacing) * 3);
  text-wrap: pretty;
}

.professional-profile__role-heading > span {
  color: var(--ui-text-muted);
  flex: none;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.professional-profile__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.professional-profile__timeline-item {
  padding-bottom: calc(var(--spacing) * 8);
  padding-left: calc(var(--spacing) * 8);
  position: relative;
}

.professional-profile__timeline-item:not(:last-child)::before {
  background: var(--ui-border);
  content: '';
  height: 100%;
  left: calc(var(--spacing) * 1.75);
  position: absolute;
  top: calc(var(--spacing) * 3);
  width: 1px;
}

.professional-profile__timeline-item:last-child {
  padding-bottom: 0;
}

.professional-profile__timeline-marker {
  background: var(--ui-primary);
  border: var(--spacing) solid var(--ui-bg);
  border-radius: 9999px;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary) 28%, transparent);
  height: calc(var(--spacing) * 4);
  left: 0;
  position: absolute;
  top: calc(var(--spacing) * 1.5);
  width: calc(var(--spacing) * 4);
}

.professional-profile__evidence-list {
  display: grid;
  gap: calc(var(--spacing) * 5);
}

.professional-profile__evidence-item:not(:last-child) {
  border-bottom: 1px solid var(--ui-border);
  padding-bottom: calc(var(--spacing) * 5);
}

.professional-profile__evidence-link {
  align-items: center;
  border-radius: var(--ui-radius);
  color: var(--ui-primary);
  display: inline-flex;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  gap: var(--spacing);
  margin-top: calc(var(--spacing) * 2);
}

.professional-profile__evidence-link:hover {
  text-decoration: underline;
}

.professional-profile__evidence-link:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

#about,
#featured-work,
#current-chapter,
#career-history,
#additional-expertise,
#community {
  scroll-margin-top: calc(var(--spacing) * 24);
}

@media (min-width: 40rem) {
  .professional-profile__portrait {
    height: calc(var(--spacing) * 48);
    width: calc(var(--spacing) * 38);
  }

  .professional-profile__spotlight {
    padding: calc(var(--spacing) * 7);
  }

  .professional-profile__spotlight-heading,
  .professional-profile__role-heading {
    flex-direction: row;
  }

  .professional-profile__spotlight-meta,
  .professional-profile__project-grid,
  .professional-profile__current-grid,
  .professional-profile__expertise-grid,
  .professional-profile__community-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width < 40rem) {
  .public-profile-detail :deep(.public-profile-hero__actions) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .public-profile-detail :deep(.public-profile-hero__actions > *) {
    justify-content: center;
    width: 100%;
  }

  .public-profile-detail
    :deep(.public-profile-hero__actions > :last-child:nth-child(odd)) {
    grid-column: 1 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .professional-profile__navigator-link {
    transition: none;
  }
}

@media print {
  .professional-profile__navigator,
  .public-profile-detail :deep(.public-profile-hero__actions) {
    display: none;
  }

  .public-profile-detail :deep(.public-profile-hero),
  .public-profile-detail :deep(.public-profile-section),
  .professional-profile__spotlight,
  .professional-profile__current-role,
  .professional-profile__project-card,
  .professional-profile__expertise-card,
  .professional-profile__community-card {
    box-shadow: none;
    break-inside: avoid;
  }

  .public-profile-detail__content {
    display: block;
  }

  .public-profile-detail__sidebar {
    margin-top: calc(var(--spacing) * 6);
    position: static;
  }
}
</style>
