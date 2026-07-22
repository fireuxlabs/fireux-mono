<template>
  <article class="mx-auto w-full max-w-6xl space-y-6">
    <PublicProfileHero
      kind-label="Agent"
      icon="i-lucide-handshake"
      :avatar-url="card.imageUrl || card.avatarUrl"
      :display-name="card.displayName || 'Agent profile'"
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
    </PublicProfileHero>

    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="space-y-6">
        <section
          v-if="aboutCopy"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm sm:p-7"
        >
          <PublicProfileSectionHeading
            icon="i-lucide-building-2"
            eyebrow="Agency"
            title="About"
          />
          <p
            class="mt-5 whitespace-pre-line text-sm leading-7 text-toned sm:text-base"
          >
            {{ aboutCopy }}
          </p>
        </section>

        <section
          v-if="focusAreas.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm sm:p-7"
        >
          <PublicProfileSectionHeading
            icon="i-lucide-briefcase-business"
            eyebrow="Recruitment"
            title="Placement focus"
          />
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div
              v-for="focusArea in focusAreas"
              :key="focusArea"
              class="flex items-center gap-3 rounded-2xl border border-default bg-elevated/45 p-4"
            >
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              >
                <UIcon name="i-lucide-user-search" class="size-4" />
              </div>
              <span class="text-sm font-medium text-highlighted">
                {{ focusArea }}
              </span>
            </div>
          </div>
        </section>
      </div>

      <aside class="space-y-4 lg:sticky lg:top-24">
        <section
          v-if="coverageAreas.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm"
        >
          <PublicProfileSectionHeading
            compact
            icon="i-lucide-map-pinned"
            eyebrow="Reach"
            title="Coverage"
          />
          <div class="mt-5 flex flex-wrap gap-2">
            <UBadge
              v-for="area in coverageAreas"
              :key="area"
              :label="area"
              color="neutral"
              variant="soft"
            />
          </div>
        </section>

        <section
          v-if="contactLinks.length"
          class="rounded-3xl border border-default bg-default p-5 shadow-sm"
        >
          <PublicProfileSectionHeading
            compact
            icon="i-lucide-message-circle"
            eyebrow="Business"
            title="Contact"
          />
          <div class="mt-5 grid gap-2">
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
        </section>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AgentCard } from '../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'
import type { PublicAgentProfile } from '../../../models/profiles/Agent/Agent.model'

const props = withDefaults(
  defineProps<{
    card: AgentCard.Card
    profile?: PublicAgentProfile | null
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
      label: 'Email agent',
      to: `mailto:${props.card.contactEmail}`,
    })
  }
  if (props.card.contactPhone) {
    links.push({
      external: false,
      icon: 'i-lucide-phone',
      label: 'Call agent',
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
