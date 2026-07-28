<template>
  <section class="fireux-ecosystems" aria-labelledby="fireux-ecosystems-title">
    <div class="fireux-ecosystems__heading">
      <div>
        <p class="fx-type-headline">Our ecosystems</p>
        <h2 id="fireux-ecosystems-title">Use what already exists.</h2>
      </div>

      <div>
        <p>
          Each ecosystem brings together apps and operations for a kind of work.
          If one fits, start there.
        </p>
        <UButton
          to="/ecosystems"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
        >
          Explore all ecosystems
        </UButton>
      </div>
    </div>

    <div
      v-if="outcome === 'pending'"
      class="fireux-ecosystems__rail"
      aria-label="Loading ecosystems"
    >
      <UPageCard
        v-for="index in 3"
        :key="index"
        variant="subtle"
        class="fireux-ecosystems__card"
      >
        <USkeleton class="h-14 w-14 rounded-2xl" />
        <USkeleton class="h-6 w-2/3" />
        <USkeleton class="h-16 w-full" />
      </UPageCard>
    </div>

    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Ecosystems could not be loaded"
      description="Please try the public Ecosystem collection again."
      :actions="[
        {
          label: 'Try again',
          color: 'error',
          variant: 'soft',
          onClick: refreshEcosystems,
        },
      ]"
    />

    <div
      v-else-if="ecosystems.length"
      class="fireux-ecosystems__rail"
      aria-label="FireUX ecosystems"
    >
      <UPageCard
        v-for="ecosystem in ecosystems"
        :key="ecosystem.id"
        :to="ecosystem.detail_url || ecosystem.website_url"
        variant="subtle"
        class="fireux-ecosystems__card"
      >
        <div class="fireux-ecosystems__identity">
          <UAvatar
            :src="ecosystem.image_url"
            :alt="ecosystem.name"
            :text="ecosystem.name"
            size="2xl"
            class="rounded-2xl"
          />
          <UBadge color="neutral" variant="soft">
            {{ appCountLabel(ecosystem.app_count) }}
          </UBadge>
        </div>

        <div class="fireux-ecosystems__body">
          <h3>{{ ecosystem.name }}</h3>
          <p>{{ ecosystem.description }}</p>
          <span>
            Explore ecosystem
            <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </span>
        </div>
      </UPageCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="ecosystems"
      state="empty"
      surface="bare"
      title="No published ecosystems yet"
      description="Published FireUX ecosystems will appear here."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlatformEcosystemDirectory } from '../../composables/usePlatformDirectory'

const ecosystemsController = usePlatformEcosystemDirectory()
const outcome = computed(() => ecosystemsController.outcome.value)
const retiredEcosystemSlugs = new Set(['cleanbox'])
const ecosystems = computed(() =>
  ecosystemsController.ecosystems.value.filter(
    (ecosystem) =>
      ecosystem.status === 'active' &&
      !retiredEcosystemSlugs.has(ecosystem.slug)
  )
)

async function refreshEcosystems(): Promise<void> {
  await ecosystemsController.refresh?.()
}

function appCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'app' : 'apps'}`
}
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.fireux-ecosystems {
  display: grid;
  gap: calc(var(--spacing) * 8);
  padding-block: calc(var(--spacing) * 10);
  border-block: 1px solid var(--ui-border);
}

.fireux-ecosystems :where(h2, h3, p) {
  margin: 0;
}

.fireux-ecosystems__heading {
  display: grid;
  gap: calc(var(--spacing) * 5);
}

.fireux-ecosystems__heading > div {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.fireux-ecosystems__heading h2 {
  max-width: 12ch;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-4xl), 11vw, 3.15rem);
  font-weight: 920;
  letter-spacing: -0.06em;
  line-height: 0.98;
  text-wrap: balance;
}

.fireux-ecosystems__heading > div:last-child > p {
  max-width: 39rem;
  color: var(--ui-text-muted);
  font-size: 0.94rem;
  line-height: 1.62;
}

.fireux-ecosystems__heading :deep(a) {
  justify-content: center;
  width: 100%;
  min-height: 2.75rem;
}

.fireux-ecosystems__rail {
  display: grid;
  grid-auto-columns: minmax(82%, 1fr);
  grid-auto-flow: column;
  overflow-x: auto;
  gap: calc(var(--spacing) * 4);
  padding-bottom: calc(var(--spacing) * 3);
  scroll-padding-inline: 0.1rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.fireux-ecosystems__rail::-webkit-scrollbar {
  display: none;
}

.fireux-ecosystems__card {
  min-width: 0;
  height: 100%;
  scroll-snap-align: start;
}

.fireux-ecosystems__card :deep(> div) {
  height: 100%;
}

.fireux-ecosystems__identity {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: calc(var(--spacing) * 4);
  min-height: 8.5rem;
  padding: calc(var(--spacing) * 5);
  border-radius: calc(var(--ui-radius) * 6);
  background: var(--ui-bg-elevated);
}

.fireux-ecosystems__body {
  display: grid;
  align-content: start;
  gap: calc(var(--spacing) * 3);
  min-height: 12rem;
  padding-top: calc(var(--spacing) * 2);
}

.fireux-ecosystems__body h3 {
  color: var(--ui-text-highlighted);
  font-size: 1.55rem;
  font-weight: 850;
  letter-spacing: -0.035em;
}

.fireux-ecosystems__body p {
  display: -webkit-box;
  overflow: hidden;
  color: var(--ui-text-muted);
  line-height: 1.62;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.fireux-ecosystems__body > span {
  display: inline-flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  align-self: end;
  margin-top: auto;
  color: var(--ui-primary);
  font-size: var(--text-sm);
  font-weight: 750;
}

@media (min-width: 40rem) {
  .fireux-ecosystems {
    padding-block: calc(var(--spacing) * 14);
  }

  .fireux-ecosystems__heading :deep(a) {
    justify-self: start;
    width: auto;
  }

  .fireux-ecosystems__rail {
    grid-auto-columns: minmax(19rem, 31%);
  }
}

@media (min-width: 64rem) {
  .fireux-ecosystems__heading {
    grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.85fr);
    align-items: end;
    gap: calc(var(--spacing) * 12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fireux-ecosystems__rail {
    scroll-behavior: auto;
  }
}
</style>
