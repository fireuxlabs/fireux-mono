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
        <UserProfileSection
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

<style scoped src="./profile.css"></style>
