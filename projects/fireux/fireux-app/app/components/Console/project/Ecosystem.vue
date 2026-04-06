<template>
  <section class="space-y-6">
    <UAlert
      v-if="error"
      color="warning"
      variant="soft"
      :title="isLive ? 'Live ecosystem refresh failed' : 'Ecosystem view flagged'"
      :description="error"
    />

    <UAlert
      v-if="!ecosystemRows.length"
      color="neutral"
      variant="soft"
      :title="emptyTitle || 'No ecosystem context found'"
      :description="emptyDescription"
    />

    <UCard
      v-for="ecosystem in ecosystemRows"
      :key="ecosystem.id"
    >
      <template #header>
        <div class="space-y-1">
          <div class="text-sm font-semibold">Ecosystem</div>
          <p class="text-sm text-dimmed">
            Surface check for the current ecosystem data.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <div class="space-y-2">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Pill</div>

          <div class="flex flex-wrap gap-3">
            <EcosystemCardsPill
              :title="ecosystem.name"
              :subtitle="ecosystem.slug"
              :image-url="ecosystem.imageUrl"
              :avatar-text="ecosystem.name"
              :badges="[
                ecosystem.status || 'active',
                ecosystem.team || 'unassigned',
                `${ecosystem.appCount} app${ecosystem.appCount === 1 ? '' : 's'}`,
              ]"
            />
          </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div class="space-y-2">
            <div class="text-xs uppercase tracking-[0.16em] text-toned">Profile</div>

            <EcosystemCardsProfile
              :id="ecosystem.id"
              :slug="ecosystem.slug"
              :name="ecosystem.name"
              :description="ecosystem.description"
              :status="ecosystem.status"
              :team="ecosystem.team"
              :app-count="ecosystem.appCount"
              :app-labels="ecosystem.appLabels"
              :image-url="ecosystem.imageUrl"
            />
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Preview</div>

              <EcosystemCardsPreview
                :id="ecosystem.id"
                :slug="ecosystem.slug"
                :name="ecosystem.name"
                :description="ecosystem.description"
                :status="ecosystem.status"
                :team="ecosystem.team"
                :app-count="ecosystem.appCount"
                :image-url="ecosystem.imageUrl"
              />
            </div>

            <div class="space-y-2">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Cell</div>

              <EcosystemCardsCell
                :title="ecosystem.name"
                :subtitle="ecosystem.slug"
                :meta="[
                  ecosystem.team ? `team: ${ecosystem.team}` : '',
                  `apps: ${ecosystem.appCount}`,
                ].filter(Boolean).join(' · ')"
                :image-url="ecosystem.imageUrl"
                :avatar-text="ecosystem.name"
                :badges="[ecosystem.status || 'active']"
              />
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-dashed border-default/40 p-3 text-sm text-dimmed">
          Surfaces present: `Pill`, `Profile`, `Preview`, `Cell`
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="text-sm font-semibold">
              {{ isLive ? 'Live ecosystem context' : 'Ecosystem Context' }}
            </div>
            <p class="text-sm text-dimmed">
              {{
                isLive
                  ? 'This view reads the selected project’s live FireUX console endpoint.'
                  : 'High-level view of the ecosystem around this project.'
              }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              v-if="!isLive && modeLabel"
              color="neutral"
              variant="soft"
            >
              {{ modeLabel }} Mode
            </UBadge>
            <UBadge color="neutral" variant="soft">
              {{ ecosystemRows.length }} ecosystem{{ ecosystemRows.length === 1 ? '' : 's' }}
            </UBadge>
            <UBadge color="neutral" variant="soft">
              {{ totalAppCount }} app{{ totalAppCount === 1 ? '' : 's' }}
            </UBadge>
            <UBadge
              v-if="isLive && databaseRows.length"
              color="neutral"
              variant="soft"
            >
              {{ databaseRows.length }} database{{ databaseRows.length === 1 ? '' : 's' }}
            </UBadge>
            <UButton
              v-if="isLive"
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              :loading="pending"
              @click="$emit('refresh')"
            >
              Refresh
            </UButton>
          </div>
        </div>
      </template>

      <div class="space-y-3">
        <div
          v-if="isLive && projectSummary.id"
          class="grid gap-3 text-sm text-dimmed sm:grid-cols-2"
        >
          <div>
            Firebase Project:
            <span class="font-medium text-default">{{ projectSummary.id }}</span>
          </div>
          <div v-if="projectSummary.mainEcosystemId">
            Main Ecosystem:
            <span class="font-medium text-default">{{ projectSummary.mainEcosystemId }}</span>
          </div>
          <div v-if="projectSummary.mainAppId">
            Main App:
            <span class="font-medium text-default">{{ projectSummary.mainAppId }}</span>
          </div>
        </div>

        <p
          v-if="!isLive && introCopy"
          class="text-sm text-dimmed"
        >
          {{ introCopy }}
        </p>

        <UButton
          to="/ecosystems"
          icon="i-lucide-orbit"
          variant="ghost"
          color="neutral"
        >
          Open public index
        </UButton>
      </div>
    </UCard>

    <UCard v-if="isLive && databaseRows.length">
      <template #header>
        <div class="text-sm font-semibold">Databases</div>
      </template>

      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="database in databaseRows"
          :key="database.name"
          color="neutral"
          variant="soft"
        >
          {{ database.name }} · {{ database.appCount }} app{{ database.appCount === 1 ? '' : 's' }}
        </UBadge>
      </div>
    </UCard>

    <DevJson
      title="Project Ecosystem Debug"
      context="console/projects/ecosystem"
      :data="debugData"
      :default-open="true"
      :hide-when-empty="false"
    />
  </section>
</template>

<script setup lang="ts">
type EcosystemRow = {
  id: string
  slug: string
  name: string
  imageUrl: string
  description: string
  status?: string
  team: string
  appCount: number
  appLabels: string[]
}

type DatabaseRow = {
  name: string
  appCount: number
}

type ProjectSummary = {
  id: string
  mainAppId: string
  mainEcosystemId: string
}

withDefaults(
  defineProps<{
    isLive?: boolean
    pending?: boolean
    error?: string
    modeLabel?: string
    introCopy?: string
    emptyTitle?: string
    emptyDescription?: string
    ecosystemRows?: EcosystemRow[]
    databaseRows?: DatabaseRow[]
    totalAppCount?: number
    projectSummary?: ProjectSummary
    debugData?: unknown
  }>(),
  {
    isLive: false,
    pending: false,
    error: '',
    modeLabel: '',
    introCopy: '',
    emptyTitle: 'No ecosystem context found',
    emptyDescription: '',
    ecosystemRows: () => [],
    databaseRows: () => [],
    totalAppCount: 0,
    projectSummary: () => ({
      id: '',
      mainAppId: '',
      mainEcosystemId: '',
    }),
    debugData: () => null,
  }
)

defineEmits<{
  (event: 'refresh'): void
}>()
</script>
