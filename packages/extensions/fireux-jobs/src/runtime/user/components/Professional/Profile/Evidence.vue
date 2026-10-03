<template>
<aside
  class="public-profile-detail__sidebar"
  aria-label="Professional evidence"
>
  <UserProfileSection
    v-if="model.languages.length"
    compact
    icon="i-lucide-languages"
    eyebrow="Communication"
    title="Languages"
  >
    <div class="space-y-3">
      <div
        v-for="language in model.languages"
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
  </UserProfileSection>

  <UserProfileSection
    v-if="model.certifications.length"
    compact
    icon="i-lucide-award"
    eyebrow="Credentials"
    title="Certifications"
  >
    <div class="professional-profile__evidence-list">
      <article
        v-for="cert in model.certifications"
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
  </UserProfileSection>

  <UserProfileSection
    v-if="model.education.length"
    compact
    icon="i-lucide-graduation-cap"
    eyebrow="Training"
    title="Education"
  >
    <div class="professional-profile__evidence-list">
      <article
        v-for="entry in model.education"
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
  </UserProfileSection>
</aside>
</template>

<script setup lang="ts">
import type { ProfessionalProfileViewModel } from '../../../composables/profiles/Professional/utils/view/useProfessionalProfileView'

defineProps<{ model: ProfessionalProfileViewModel }>()

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
</style>
