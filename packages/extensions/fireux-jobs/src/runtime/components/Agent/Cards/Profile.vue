<template>
  <article class="public-profile-detail" data-profile-tone="agent">
    <UserProfileHero
      kind-label="Hiring profile"
      icon="i-lucide-handshake"
      tone="info"
      :avatar-url="card.imageUrl || card.avatarUrl"
      :display-name="card.displayName || 'Hiring profile'"
      :handle="card.handle"
      :subtitle="profile?.subtitle"
      :title="card.title"
      :summary="heroSummary"
      :tagline="profile?.tagline"
      :labels="profileLabels"
      :stats="profileStats"
    >
      <template #actions>
        <slot name="actions" />
      </template>
    </UserProfileHero>

    <div class="public-profile-detail__content">
      <div class="public-profile-detail__main">
        <UserProfileSection
          v-if="aboutCopy"
          icon="i-lucide-building-2"
          eyebrow="Hiring team"
          title="About"
        >
          <p
            class="whitespace-pre-line text-sm leading-7 text-toned sm:text-base"
          >
            {{ aboutCopy }}
          </p>
        </UserProfileSection>

        <UserProfileSection
          v-if="focusAreas.length"
          icon="i-lucide-briefcase-business"
          eyebrow="Hiring"
          title="Placement focus"
        >
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="focusArea in focusAreas"
              :key="focusArea"
              class="flex items-center gap-3 rounded-2xl border border-default bg-elevated/45 p-4"
            >
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info"
              >
                <UIcon name="i-lucide-user-search" class="size-4" />
              </div>
              <span class="text-sm font-medium text-highlighted">
                {{ focusArea }}
              </span>
            </div>
          </div>
        </UserProfileSection>
      </div>

      <aside class="public-profile-detail__sidebar">
        <UserProfileSection
          v-if="coverageAreas.length"
          compact
          icon="i-lucide-map-pinned"
          eyebrow="Reach"
          title="Coverage"
        >
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="area in coverageAreas"
              :key="area"
              :label="area"
              color="neutral"
              variant="soft"
            />
          </div>
        </UserProfileSection>

        <UserProfileSection
          v-if="contactLinks.length"
          compact
          icon="i-lucide-message-circle"
          eyebrow="Business"
          title="Contact"
        >
          <div class="grid gap-2">
            <UButton
              v-for="contact in contactLinks"
              :key="contact.label"
              :to="contact.to"
              :target="contact.external ? '_blank' : undefined"
              :rel="contact.external ? 'noreferrer' : undefined"
              :label="contact.label"
              :icon="contact.icon"
              color="neutral"
              variant="soft"
              block
            />
          </div>
        </UserProfileSection>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AgentCard } from '../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'
import type { AgentProfile } from '../../../models/profiles/Agent/Agent.model'

const props = withDefaults(
  defineProps<{
    card: AgentCard.Card
    profile?: AgentProfile | null
    prop?: string
    showSubtitle?: boolean
  }>(),
  {
    profile: null,
    prop: '',
    showSubtitle: true,
  }
)

const cleanList = (values: unknown) =>
  Array.isArray(values)
    ? values.map((value) => String(value || '').trim()).filter(Boolean)
    : []

const heroSummary = computed(() =>
  String(
    props.prop || props.card.summary || props.profile?.summary || ''
  ).trim()
)
const aboutCopy = computed(() => {
  const bio = String(props.profile?.agent_bio || '').trim()
  return bio && bio !== heroSummary.value ? bio : ''
})
const placementTypes = computed(() =>
  cleanList(props.profile?.agent_placement_types)
)
const focusAreas = computed(() =>
  Array.from(
    new Set([...placementTypes.value, ...cleanList(props.profile?.tags)])
  )
)
const coverageAreas = computed(() =>
  cleanList(props.profile?.agent_coverage_areas)
)
const profileLabels = computed(() =>
  Array.from(new Set([...focusAreas.value, ...props.card.badges]))
)
const contactLinks = computed(() => {
  const links: Array<{
    external: boolean
    icon: string
    label: string
    to: string
  }> = []
  if (props.card.contactEmail) {
    links.push({
      external: false,
      icon: 'i-lucide-mail',
      label: 'Email hiring team',
      to: `mailto:${props.card.contactEmail}`,
    })
  }
  if (props.card.contactPhone) {
    links.push({
      external: false,
      icon: 'i-lucide-phone',
      label: 'Call hiring team',
      to: `tel:${props.card.contactPhone}`,
    })
  }
  if (props.card.websiteUrl) {
    links.push({
      external: true,
      icon: 'i-lucide-globe-2',
      label: 'Visit website',
      to: props.card.websiteUrl,
    })
  }
  return links
})
const profileStats = computed(() =>
  [
    {
      label: 'Focus areas',
      value: focusAreas.value.length,
      icon: 'i-lucide-users-round',
    },
    coverageAreas.value.length
      ? {
          label: 'Coverage areas',
          value: coverageAreas.value.length,
          icon: 'i-lucide-map-pinned',
        }
      : null,
    {
      label: 'Contact routes',
      value: contactLinks.value.length,
      icon: 'i-lucide-message-circle',
    },
  ].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)
</script>
