import { computed, ref, watch } from 'vue'
import type { ProfessionalCard } from './useProfessionalInterface'
import type {
  ProfessionalProfileOtherExperience,
  ProfessionalProfileRelevantExperience,
  ProfessionalProfileViewModel,
} from './useProfessionalProfileView'
import type { PublicProfessionalProfile } from '../../../../../../../models/profiles/Professional/Professional.model'
import type { ProjectItem } from '../../../../../../../models/profiles/Professional/supporting'

export interface ProfessionalProfilePresentationProps {
  model?: ProfessionalProfileViewModel | null
  card?: ProfessionalCard.Card
  profile?: PublicProfessionalProfile | null
  prop?: string
}

export function useProfessionalProfilePresentation(
  props: ProfessionalProfilePresentationProps
) {
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

  return {
    aboutCopy,
    activeExperienceCount,
    additionalProjects,
    currentRelevantExperience,
    formatExperienceDates,
    formatProficiency,
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
  }
}
