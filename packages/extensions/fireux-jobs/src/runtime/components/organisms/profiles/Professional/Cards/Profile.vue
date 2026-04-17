<template>
  <div v-if="viewModel" class="mx-auto w-full max-w-3xl space-y-3">
    <ProfilesProfessionalCardsCell
      v-bind="viewModel.identityCard"
      :show-tagline="true"
      :show-subtitle="true"
      :link="Boolean(viewModel.identityCard.to)"
    />

    <UCard class="profile-card">
      <ClientOnly>
        <UAccordion
          :items="viewModel.accordionItems"
          :default-value="['summary', 'bio', 'relevant_experience']"
          type="multiple"
          variant="soft"
          size="sm"
        >
          <template #body="{ item }">
            <div v-if="item.value === 'summary'" class="-mt-2">
              <div v-if="viewModel.prop">{{ viewModel.prop }}</div>
              <p v-if="viewModel.summary" class="form-text-body">
                {{ viewModel.summary }}
              </p>
              <p v-else class="form-text-body">No summary listed.</p>
            </div>

            <div v-else-if="item.value === 'bio'">
              <p v-if="viewModel.bio" class="form-text-body">
                {{ viewModel.bio }}
              </p>
              <p v-else class="form-text-body">No bio listed.</p>
            </div>

            <div v-else-if="item.value === 'relevant_experience'">
              <div
                v-if="
                  viewModel.relevantExperience.length ||
                  viewModel.otherExperience.length
                "
                class="space-y-4"
              >
                <div
                  v-for="entry in viewModel.relevantExperience"
                  :key="`relevant-${entry.item.place_id}-${entry.item.role}`"
                  class="space-y-1"
                >
                  <div
                    class="flex flex-wrap items-center justify-between gap-3"
                  >
                    <span class="text-sm font-semibold text-gray-100">
                      {{ entry.item.role || 'Role' }}
                    </span>
                    <span class="ml-auto text-xs text-gray-300">
                      {{ formatExperienceDates(entry.item) }}
                    </span>
                  </div>
                  <div class="mt-2">
                    <PlaceCardsPill
                      v-if="entry.placeCard"
                      v-bind="entry.placeCard"
                      :show-badges="false"
                    />
                    <div v-else class="text-xs text-gray-500">
                      Location unavailable
                    </div>
                  </div>
                  <p v-if="entry.item.responsibilities" class="form-text-body">
                    {{ entry.item.responsibilities }}
                  </p>
                </div>

                <div
                  v-for="entry in viewModel.otherExperience"
                  :key="`other-${entry.item.place_id}-${entry.item.role}`"
                  class="space-y-1"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <UBadge size="xs" variant="soft" color="neutral">
                      {{ entry.item.role }}
                    </UBadge>
                    <span class="text-xs text-gray-500">{{
                      formatExperienceDates(entry.item)
                    }}</span>
                  </div>
                  <div>
                    <PlaceCardsPill
                      :image-url="entry.imageUrl"
                      :title="entry.title"
                      :subtitle="entry.subtitle"
                      :show-badges="false"
                      :show-subtitle="entry.showSubtitle"
                    />
                  </div>
                  <p v-if="entry.item.responsibilities" class="form-text-body">
                    {{ entry.item.responsibilities }}
                  </p>
                </div>
              </div>
              <p v-else>No experience listed.</p>
            </div>

            <div v-else-if="item.value === 'languages'">
              <div v-if="viewModel.languages.length">
                <UBadge
                  v-for="language in viewModel.languages"
                  :key="`${language.language}-${language.proficiency}`"
                  variant="soft"
                  color="neutral"
                  size="xs"
                >
                  {{ language.language
                  }}{{
                    language.proficiency ? ` · ${language.proficiency}` : ''
                  }}
                </UBadge>
              </div>
              <p v-else>No languages listed.</p>
            </div>

            <div v-else-if="item.value === 'certifications'">
              <div v-if="viewModel.certifications.length">
                <div
                  v-for="cert in viewModel.certifications"
                  :key="`${cert.name}-${cert.year}`"
                >
                  <div>{{ cert.name }}</div>
                  <div>
                    {{ cert.place_name }} · {{ cert.year || 'Year not listed' }}
                  </div>
                  <a
                    v-if="cert.document_url"
                    :href="cert.document_url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View document
                  </a>
                </div>
              </div>
              <p v-else>No certifications listed.</p>
            </div>

            <div v-else-if="item.value === 'education'">
              <div v-if="viewModel.education.length">
                <div
                  v-for="entry in viewModel.education"
                  :key="`${entry.institution}-${entry.degree}`"
                >
                  <div>{{ entry.degree }}</div>
                  <div>
                    {{ entry.institution }} ·
                    {{
                      formatRange(
                        entry.start_year,
                        entry.end_year,
                        entry.ongoing
                      )
                    }}
                  </div>
                  <a
                    v-if="entry.document_url"
                    :href="entry.document_url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View document
                  </a>
                </div>
              </div>
              <p v-else>No education listed.</p>
            </div>

            <div v-else-if="item.value === 'volunteering'">
              <div v-if="viewModel.volunteering.length">
                <div
                  v-for="entry in viewModel.volunteering"
                  :key="`${entry.organization}-${entry.role}`"
                >
                  <div>{{ entry.organization }}</div>
                  <div>
                    {{ entry.role }} ·
                    {{
                      formatRange(entry.from_year, entry.to_year, entry.ongoing)
                    }}
                  </div>
                  <p
                    v-if="entry.responsibilities"
                    class="form-text form-text-muted"
                  >
                    {{ entry.responsibilities }}
                  </p>
                </div>
              </div>
              <p v-else>No volunteering listed.</p>
            </div>

            <div v-else-if="item.value === 'projects'">
              <div v-if="viewModel.projects.length">
                <div
                  v-for="project in viewModel.projects"
                  :key="`${project.name}-${project.role}`"
                >
                  <div>{{ project.name }}</div>
                  <div>
                    {{ project.role }} ·
                    {{
                      formatRange(
                        project.from_year,
                        project.to_year,
                        project.ongoing
                      )
                    }}
                  </div>
                  <p
                    v-if="project.responsibilities"
                    class="form-text form-text-muted"
                  >
                    {{ project.responsibilities }}
                  </p>
                </div>
              </div>
              <p v-else>No projects listed.</p>
            </div>
          </template>
        </UAccordion>
        <template #fallback>
          <div>Loading profile details…</div>
        </template>
      </ClientOnly>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import type { ProfessionalProfileViewModel } from '../../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalProfileView'
import type { Professional } from '../../../../../models/profiles/Professional/Professional.model'

const props = defineProps<{
  model?: ProfessionalProfileViewModel | null
  card?: ProfessionalCard.Card
  profile?: Professional | null
  prop?: string
}>()

const viewModel = computed<ProfessionalProfileViewModel | null>(() => {
  if (props.model) return props.model
  if (!props.card || !props.profile) return null

  return {
    identityCard: props.card,
    prop: String(props.prop ?? '').trim(),
    summary: String(props.profile.summary ?? '').trim(),
    bio: String(props.profile.bio ?? '').trim(),
    relevantExperience: (props.profile.relevant_experience ?? []).map(
      (item) => ({
        item,
        placeCard: null,
      })
    ),
    otherExperience: (props.profile.other_experience ?? []).map((item) => {
      const subtitle = String(
        (item as any).short_address || (item as any).formatted_address || ''
      ).trim()
      return {
        item,
        title: String((item as any).name || 'External venue').trim(),
        subtitle,
        imageUrl: String((item as any).image_url || '').trim(),
        showSubtitle: Boolean(subtitle),
      }
    }),
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
