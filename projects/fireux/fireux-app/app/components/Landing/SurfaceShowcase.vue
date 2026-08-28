<template>
  <section
    id="fireux-project-surface"
    class="fireux-surface-showcase"
    aria-labelledby="fireux-project-surface-title"
  >
    <div class="fireux-surface-showcase__presentation" data-landing-reveal="up">
      <div class="fireux-surface-showcase__system">
        <LandingWorkspacePreview
          v-model:surface-id="selectedSurfaceId"
          :operations="operations"
        />
      </div>

      <div class="fireux-surface-showcase__literature">
        <div class="fireux-surface-showcase__copy">
          <h2 id="fireux-project-surface-title" class="fx-type-section-display">
            {{ copy.title }}
          </h2>
          <p class="fx-type-body">{{ copy.description }}</p>
          <p v-if="copy.supporting" class="fx-type-caption">
            {{ copy.supporting }}
          </p>
        </div>

        <div class="fireux-surface-showcase__uses">
          <p>Includes</p>
          <ul>
            <li v-for="item in copy.items" :key="item">
              <UIcon name="i-lucide-check" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <UButton
          :to="copy.to"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ copy.action }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingWorkspacePreviewItem } from 'fireux-core/types/landing-product'

type PreviewOperation = LandingWorkspacePreviewItem & {
  description: string
  to: string
}

type SurfaceCopy = {
  action: string
  description: string
  items: readonly string[]
  supporting?: string
  title: string
  to: string
}

defineProps<{
  copy: SurfaceCopy
  operations: readonly PreviewOperation[]
}>()

const selectedSurfaceId = defineModel<string>('surfaceId', {
  default: 'project.apps',
})
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.fireux-surface-showcase {
  min-width: 0;
  padding-block: calc(var(--spacing) * 10);
}

.fireux-surface-showcase :where(h2, p) {
  margin: 0;
}

.fireux-surface-showcase__copy,
.fireux-surface-showcase__uses {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.fireux-surface-showcase__presentation {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 8);
}

.fireux-surface-showcase__system,
.fireux-surface-showcase__literature {
  min-width: 0;
}

.fireux-surface-showcase__literature {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: calc(var(--spacing) * 6);
}

.fireux-surface-showcase__uses {
  width: 100%;
}

.fireux-surface-showcase__uses > p {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
}

.fireux-surface-showcase__uses ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.fireux-surface-showcase__uses li {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.fireux-surface-showcase__uses li svg {
  flex: 0 0 auto;
  margin-top: 0.15rem;
  color: var(--ui-primary);
}

@media (min-width: 640px) {
  .fireux-surface-showcase {
    padding-block: calc(var(--spacing) * 14);
  }
}

@media (min-width: 1024px) {
  .fireux-surface-showcase__presentation {
    grid-template-columns: minmax(28rem, 1.05fr) minmax(26rem, 0.95fr);
    align-items: start;
    gap: calc(var(--spacing) * 12);
  }
}
</style>
