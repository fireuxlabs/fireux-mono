<template>
  <section
    class="fireux-card-orbit"
    :class="{ 'fireux-card-orbit--hero': presentation === 'hero' }"
    :aria-labelledby="
      presentation === 'section' ? 'fireux-card-orbit-title' : undefined
    "
    :aria-label="
      presentation === 'hero'
        ? 'Published FireUX apps and ecosystems'
        : undefined
    "
    :data-landing-reveal="presentation === 'section' ? 'up' : undefined"
  >
    <header
      v-if="presentation === 'section'"
      class="fireux-card-orbit__heading"
    >
      <p class="fx-type-headline">Shared cards</p>
      <h2 id="fireux-card-orbit-title" class="fx-type-section-title">
        Published apps and ecosystems.
      </h2>
      <p class="text-muted">
        The same public records move through Cell, Pill, and Preview surfaces.
      </p>
    </header>

    <LandingCardOrbit
      v-if="orbitItems.length"
      :items="orbitItems"
      :data-source="orbitDataSource"
      aria-label="Published FireUX card orbit"
    >
      <template #item="{ item }">
        <div
          v-if="item.id === 'app-cell' && appCellCard"
          class="fireux-card-orbit__card fireux-card-orbit__card--cell"
        >
          <AppCardsCell v-bind="appCellCard" :link="false" />
        </div>

        <div
          v-else-if="item.id === 'ecosystem-pill' && ecosystemPillCard"
          class="fireux-card-orbit__card fireux-card-orbit__card--pill"
        >
          <EcosystemCardsPill v-bind="ecosystemPillCard" :link="false" />
        </div>

        <div
          v-else-if="item.id === 'app-preview' && appPreviewCard"
          class="fireux-card-orbit__card fireux-card-orbit__card--preview"
        >
          <AppCardsPreview v-bind="appPreviewCard" />
        </div>

        <div
          v-else-if="item.id === 'ecosystem-cell' && ecosystemCellCard"
          class="fireux-card-orbit__card fireux-card-orbit__card--cell"
        >
          <EcosystemCardsCell v-bind="ecosystemCellCard" :link="false" />
        </div>

        <div
          v-else-if="item.id === 'app-pill' && appPillCard"
          class="fireux-card-orbit__card fireux-card-orbit__card--pill"
        >
          <AppCardsPill v-bind="appPillCard" :link="false" />
        </div>

        <div
          v-else-if="item.id === 'ecosystem-preview' && ecosystemPreviewCard"
          class="fireux-card-orbit__card fireux-card-orbit__card--preview"
        >
          <EcosystemCardsPreview :item="ecosystemPreviewCard" />
        </div>
      </template>
    </LandingCardOrbit>

    <div v-else-if="pending" class="fireux-card-orbit__loading">
      <USkeleton />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Published cards could not be loaded"
      description="The public App and Ecosystem directory is temporarily unavailable."
    />

    <MoleculesStateCard
      v-else
      entity="published apps and ecosystems"
      state="empty"
      surface="bare"
      title="No published cards yet"
      description="Published Apps and Ecosystems will appear here."
    />

    <div v-if="presentation === 'section'" class="fireux-card-orbit__actions">
      <UButton
        to="/apps"
        color="neutral"
        variant="soft"
        trailing-icon="i-lucide-arrow-right"
      >
        Browse apps
      </UButton>
      <UButton
        to="/ecosystems"
        color="neutral"
        variant="ghost"
        trailing-icon="i-lucide-arrow-right"
      >
        Browse ecosystems
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  LandingCardOrbitDataSource,
  LandingCardOrbitItem,
} from 'fireux-core/types/landing-card-orbit'
import type {
  AppDirectoryEntry,
  EcosystemDirectoryEntry,
} from 'fireux-core/runtime/models/core/supporting/directory'
import {
  useAppInterface,
  type AppCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import {
  useEcosystemInterface,
  type EcosystemInterfaceCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import {
  usePlatformDirectory,
  usePublishedPlatformEcosystemDirectory,
} from '../../../composables/usePlatformDirectory'

withDefaults(
  defineProps<{
    presentation?: 'hero' | 'section'
  }>(),
  {
    presentation: 'section',
  }
)

const { data, pending, error } = usePlatformDirectory()
const { ecosystems: publishedEcosystems } =
  usePublishedPlatformEcosystemDirectory()
const orbitDataSource = 'live' satisfies LandingCardOrbitDataSource
const {
  cell: toAppCell,
  pill: toAppPill,
  preview: toAppPreview,
} = useAppInterface()
const {
  cell: toEcosystemCell,
  pill: toEcosystemPill,
  preview: toEcosystemPreview,
} = useEcosystemInterface()

type EcosystemPreviewCard = NonNullable<ReturnType<typeof toEcosystemPreview>>
const directoryApps = computed<readonly AppDirectoryEntry[]>(
  () => data.value?.apps ?? []
)
const directoryEcosystems = computed<readonly EcosystemDirectoryEntry[]>(
  () => publishedEcosystems.value
)

const appCards = computed<AppCard.Card[]>(() =>
  directoryApps.value
    .map((entry) => toAppCell(entry as Parameters<typeof toAppCell>[0]))
    .filter((card): card is AppCard.Card => Boolean(card))
)

const ecosystemCards = computed<EcosystemInterfaceCard[]>(() =>
  directoryEcosystems.value
    .map((entry) =>
      toEcosystemCell({
        ...entry,
        href: entry.detail_url,
        appCount: entry.app_count,
      })
    )
    .filter((card): card is EcosystemInterfaceCard => Boolean(card))
)

const ecosystemPreviewCards = computed<EcosystemPreviewCard[]>(() =>
  directoryEcosystems.value
    .map((entry) =>
      toEcosystemPreview({
        ...entry,
        href: entry.detail_url,
        appCount: entry.app_count,
      })
    )
    .filter((card): card is EcosystemPreviewCard => Boolean(card))
)

const pick = <T,>(items: readonly T[], index: number): T | null =>
  items.length ? (items[index % items.length] ?? null) : null

const appCellCard = computed(() => pick(appCards.value, 0))
const appPreviewCard = computed(() => {
  const source = pick(directoryApps.value, 1)
  return source
    ? toAppPreview(source as Parameters<typeof toAppPreview>[0])
    : null
})
const appPillCard = computed(() => {
  const source = pick(directoryApps.value, 2)
  return source ? toAppPill(source as Parameters<typeof toAppPill>[0]) : null
})
const ecosystemCellCard = computed(() => pick(ecosystemCards.value, 1))
const ecosystemPillCard = computed(() => {
  const source = pick(directoryEcosystems.value, 0)
  return source
    ? toEcosystemPill({
        ...source,
        href: source.detail_url,
        appCount: source.app_count,
      })
    : null
})
const ecosystemPreviewCard = computed(() =>
  pick(ecosystemPreviewCards.value, 2)
)

const orbitItems = computed<LandingCardOrbitItem[]>(() => {
  const items: LandingCardOrbitItem[] = []

  if (appCellCard.value) {
    items.push({ id: 'app-cell', label: 'App · Cell' })
  }
  if (ecosystemPillCard.value) {
    items.push({ id: 'ecosystem-pill', label: 'Ecosystem · Pill' })
  }
  if (appPreviewCard.value) {
    items.push({ id: 'app-preview', label: 'App · Preview' })
  }
  if (ecosystemCellCard.value) {
    items.push({ id: 'ecosystem-cell', label: 'Ecosystem · Cell' })
  }
  if (appPillCard.value) {
    items.push({ id: 'app-pill', label: 'App · Pill' })
  }
  if (ecosystemPreviewCard.value) {
    items.push({ id: 'ecosystem-preview', label: 'Ecosystem · Preview' })
  }

  return items
})
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.fireux-card-orbit {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 6);
  padding-block: calc(var(--spacing) * 10);
  border-block: 1px solid var(--ui-border);
}

.fireux-card-orbit--hero {
  gap: 0;
  padding-block: 0;
  border-block: 0;
}

.fireux-card-orbit__heading {
  display: grid;
  max-width: 42rem;
  gap: calc(var(--spacing) * 3);
}

.fireux-card-orbit__heading :where(h2, p) {
  margin: 0;
}

.fireux-card-orbit__card {
  max-width: calc(100vw - var(--spacing) * 8);
}

.fireux-card-orbit__card--cell,
.fireux-card-orbit__card--preview {
  width: min(20rem, calc(100vw - var(--spacing) * 8));
}

.fireux-card-orbit__card--pill {
  width: min(14rem, calc(100vw - var(--spacing) * 8));
}

.fireux-card-orbit__loading {
  display: grid;
  min-height: 42rem;
  place-items: center;
}

.fireux-card-orbit__loading > * {
  width: min(24rem, 72vw);
  height: calc(var(--spacing) * 24);
}

.fireux-card-orbit__actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
</style>
