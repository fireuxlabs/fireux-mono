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
    <UserProfileHero
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
    </UserProfileHero>

    <nav
      v-if="sectionLinks.length > 1"
      class="professional-profile__navigator"
      aria-label="Professional profile sections"
    >
      <span class="professional-profile__navigator-label">Portfolio</span>
      <div class="professional-profile__navigator-links">
        <ULink
          v-for="link in sectionLinks"
          :key="link.to"
          :to="link.to"
          class="professional-profile__navigator-link"
        >
          {{ link.label }}
        </ULink>
      </div>
    </nav>

    <div class="public-profile-detail__content">
      <div class="public-profile-detail__main">
        <UserProfileSection
          v-if="aboutCopy"
          id="about"
          icon="i-lucide-user-round"
          eyebrow="Profile"
          title="About"
        >
          <p class="whitespace-pre-line">
            {{ aboutCopy }}
          </p>
        </UserProfileSection>

        <UserProfileSection
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
              <h3 class="fx-type-card-title">
                {{ project.name }}
              </h3>
              <p>
                {{ project.role }} ·
                {{
                  formatRange(
                    project.from_year,
                    project.to_year,
                    project.ongoing
                  )
                }}
              </p>
              <p v-if="project.responsibilities" class="whitespace-pre-line">
                {{ project.responsibilities }}
              </p>
            </article>
          </div>
        </UserProfileSection>

        <UserProfileSection
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
                <h3 class="fx-type-card-title">
                  {{ entry.item.role || 'Professional role' }}
                </h3>
                <span v-if="formatExperienceDates(entry.item)">
                  {{ formatExperienceDates(entry.item) }}
                </span>
              </div>

              <div v-if="entry.placeCard">
                <PlaceCardsPill v-bind="entry.placeCard" :show-badges="false" />
              </div>

              <p v-if="entry.item.responsibilities" class="whitespace-pre-line">
                {{ entry.item.responsibilities }}
              </p>
            </article>
          </div>
        </UserProfileSection>

        <UserProfileSection
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
                <h3 class="fx-type-card-title">
                  {{ entry.item.role || 'Professional role' }}
                </h3>
                <span v-if="formatExperienceDates(entry.item)">
                  {{ formatExperienceDates(entry.item) }}
                </span>
              </div>

              <div v-if="entry.placeCard">
                <PlaceCardsPill v-bind="entry.placeCard" :show-badges="false" />
              </div>

              <p v-if="entry.item.responsibilities" class="whitespace-pre-line">
                {{ entry.item.responsibilities }}
              </p>
            </li>
          </ol>
        </UserProfileSection>

        <UserProfileSection
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
                <div>
                  <h3 class="fx-type-card-title">
                    {{ entry.item.role || 'Professional role' }}
                  </h3>
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

              <div v-if="entry.placeCard">
                <PlaceCardsPill v-bind="entry.placeCard" :show-badges="false" />
              </div>

              <p v-if="entry.item.responsibilities" class="whitespace-pre-line">
                {{ entry.item.responsibilities }}
              </p>
            </article>
          </div>
        </UserProfileSection>

        <UserProfileSection
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
                  <h3 class="fx-type-card-title">{{ entry.organization }}</h3>
                  <p>
                    {{ entry.role }}
                  </p>
                </div>
                <span>
                  {{
                    formatRange(entry.from_year, entry.to_year, entry.ongoing)
                  }}
                </span>
              </div>
              <p v-if="entry.responsibilities" class="whitespace-pre-line">
                {{ entry.responsibilities }}
              </p>
            </article>
          </div>
        </UserProfileSection>
      </div>

      <ProfessionalProfileEvidence :model="viewModel" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../composables/profiles/Professional/utils/view/useProfessionalInterface'
import type { ProfessionalProfileViewModel } from '../../../composables/profiles/Professional/utils/view/useProfessionalProfileView'
import type { ProfessionalProfile } from '../../../utils/profiles/Professional/professional'
import { useProfessionalProfilePresentation } from '../../../composables/profiles/Professional/utils/view/useProfessionalProfilePresentation'

const props = defineProps<{
  model?: ProfessionalProfileViewModel | null
  card?: ProfessionalCard.Card
  profile?: ProfessionalProfile | null
  prop?: string
}>()

const {
  aboutCopy,
  activeExperienceCount,
  additionalProjects,
  currentRelevantExperience,
  formatExperienceDates,
  formatRange,
  heroSummary,
  leadProject,
  pastRelevantExperience,
  portraitImageFailed,
  profileImage,
  profileLabels,
  profileStats,
  sectionLinks,
  sortedOtherExperience,
  viewModel,
} = useProfessionalProfilePresentation(props)
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
  backdrop-filter: blur(calc(var(--spacing) * 4));
  background: color-mix(in srgb, var(--ui-bg) 78%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-border) 76%, transparent);
  border-radius: calc(var(--ui-radius) * 3);
  box-shadow: 0 calc(var(--spacing) * 2) calc(var(--spacing) * 8)
    color-mix(in srgb, var(--ui-bg-inverted) 8%, transparent);
  display: flex;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
  padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 3);
  position: sticky;
  top: calc(var(--spacing) * 3);
  z-index: 20;
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

@media (min-width: 64rem) {
  .public-profile-detail :deep(.public-profile-hero) {
    background:
      radial-gradient(
        circle at 88% 12%,
        color-mix(in srgb, var(--ui-primary) 16%, transparent),
        transparent 34%
      ),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--ui-bg-elevated) 92%, transparent),
        color-mix(in srgb, var(--ui-bg) 82%, transparent)
      );
  }

  .public-profile-detail :deep(.public-profile-hero__layout) {
    grid-template-columns: minmax(0, 1fr);
  }

  .public-profile-detail :deep(.public-profile-hero__stats) {
    border-top: 1px solid var(--ui-border);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding-top: calc(var(--spacing) * 5);
    width: 100%;
  }

  .public-profile-detail :deep(.public-profile-hero__stat) {
    min-height: calc(var(--spacing) * 20);
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
