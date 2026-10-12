<template>
  <section
    id="misebox-ordering-surface"
    class="misebox-ordering-showcase"
    aria-labelledby="misebox-ordering-surface-title"
  >
    <div class="misebox-ordering-showcase__controls">
      <p class="fx-type-headline">Surfaces</p>

      <div
        class="misebox-ordering-showcase__selector"
        role="group"
        aria-label="Ordering surfaces"
      >
        <button
          v-for="surface in surfaces"
          :key="surface.id"
          type="button"
          :aria-pressed="selectedId === surface.id"
          @click="selectedId = surface.id"
        >
          <UIcon :name="surface.icon" aria-hidden="true" />
          <span>{{ surface.label }}</span>
        </button>
      </div>
    </div>

    <div class="misebox-ordering-showcase__presentation">
      <div
        class="misebox-ordering-showcase__system"
        data-landing-reveal="scale"
      >
        <LandingOrderingPreview :mode="selected.preview" />
      </div>

      <div
        class="misebox-ordering-showcase__literature"
        data-landing-reveal="up"
      >
        <div class="misebox-ordering-showcase__detail-stage">
          <div class="misebox-ordering-showcase__detail">
            <div class="misebox-ordering-showcase__copy">
              <h2
                id="misebox-ordering-surface-title"
                class="fx-type-section-display"
              >
                {{ selected.title }}
              </h2>
              <p class="fx-type-body">
                {{ selected.description }}
              </p>
            </div>

            <div class="misebox-ordering-showcase__uses">
              <p>Good for</p>
              <ul>
                <li v-for="use in selected.goodFor" :key="use">
                  <UIcon name="i-lucide-check" aria-hidden="true" />
                  <span>{{ use }}</span>
                </li>
              </ul>
            </div>

            <UButton
              :to="selected.id === 'workspace' ? workspaceEntryHref : selected.to"
              color="neutral"
              variant="soft"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ selected.action }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'

const { workspaceEntryHref } = useWorkspaceEntryCta('kitchen')

type SurfaceId = 'mobile' | 'kiosk' | 'staff-pos' | 'workspace'

type OrderingSurface = {
  id: SurfaceId
  label: string
  title: string
  description: string
  goodFor: readonly string[]
  icon: string
  action: string
  to: string
  preview: SurfaceId
}

const surfaces = [
  {
    id: 'mobile',
    label: 'Mobile',
    title: 'Mobile Menu',
    description:
      'Guests open the published Menu on their own phone. It stays readable and presents only the ordering paths configured by the selected Menu and Kitchen.',
    goodFor: [
      'Browsing the Menu',
      'Delivery',
      'Collection',
      'Ordering from a Table QR',
      'Pre-orders',
      'Room service',
    ],
    icon: 'i-lucide-smartphone',
    action: 'Explore mobile ordering',
    to: '/tools/ordering',
    preview: 'mobile',
  },
  {
    id: 'kiosk',
    label: 'Kiosk',
    title: 'Self-service Kiosk',
    description:
      'Guests browse and order on a shared portrait terminal. Eat here and Take away remain modes within the same Kiosk.',
    goodFor: [
      'Guest-operated ordering',
      'Eat-here orders',
      'Takeaway orders',
      'Orders sent to the Kitchen Workspace',
    ],
    icon: 'i-lucide-tablet',
    action: 'Open self-service kiosk',
    to: '/demo/kiosk',
    preview: 'kiosk',
  },
  {
    id: 'staff-pos',
    label: 'Staff POS',
    title: 'Staff POS',
    description:
      'Staff enter in-store orders directly from the Menu in a faster, denser operator view. The order uses the same basket and ticket as guest ordering.',
    goodFor: [
      'Counter orders entered by staff',
      'Eat-in orders',
      'Takeaway orders',
      'Fast access to the published Menu',
    ],
    icon: 'i-lucide-monitor',
    action: 'Explore Staff POS',
    to: '/ordering/staff-pos',
    preview: 'staff-pos',
  },
  {
    id: 'workspace',
    label: 'Workspace',
    title: 'Kitchen Workspace',
    description:
      'The Kitchen team works from one operational Workspace. Each Operation opens the records and tools needed to run that part of the Kitchen.',
    goodFor: [
      'Developing dishes and menus',
      'Recipes and ingredients',
      'Stations',
      'Orders and service',
      'Teams and suppliers',
      'Finance',
    ],
    icon: 'i-lucide-panels-top-left',
    action: 'Open Kitchen Workspace',
    to: '/',
    preview: 'workspace',
  },
] as const satisfies readonly OrderingSurface[]

const selectedId = ref<SurfaceId>('mobile')
const selected = computed(
  () =>
    surfaces.find((surface) => surface.id === selectedId.value) ?? surfaces[0]
)
</script>

<style scoped>
.misebox-ordering-showcase {
  min-width: 0;
  padding-block: calc(var(--spacing) * 10);
}

.misebox-ordering-showcase__controls {
  display: grid;
  gap: calc(var(--spacing) * 4);
  margin-bottom: calc(var(--spacing) * 8);
}

.misebox-ordering-showcase__controls > p {
  margin: 0;
}

.misebox-ordering-showcase__presentation {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 8);
}

.misebox-ordering-showcase__system,
.misebox-ordering-showcase__literature {
  min-width: 0;
}

.misebox-ordering-showcase__literature {
  display: grid;
  align-content: start;
  justify-items: start;
}

.misebox-ordering-showcase__literature :where(h2, p) {
  margin: 0;
}

.misebox-ordering-showcase__selector {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) * 1);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
}

.misebox-ordering-showcase__selector button {
  display: grid;
  min-height: 4rem;
  place-items: center;
  gap: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) * 2);
  border-radius: calc(var(--ui-radius) * 3);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.misebox-ordering-showcase__selector button[aria-pressed='true'] {
  background: var(--ui-primary);
  color: var(--ui-color-primary-contrast);
}

.misebox-ordering-showcase__selector svg {
  width: 1.15rem;
  height: 1.15rem;
}

.misebox-ordering-showcase__copy {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.misebox-ordering-showcase__detail-stage {
  position: relative;
  width: 100%;
  min-height: 20rem;
  overflow: hidden;
}

.misebox-ordering-showcase__detail {
  display: grid;
  width: 100%;
  justify-items: start;
  gap: calc(var(--spacing) * 6);
}

.misebox-ordering-showcase__uses {
  display: grid;
  width: 100%;
  gap: calc(var(--spacing) * 3);
}

.misebox-ordering-showcase__uses > p {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
}

.misebox-ordering-showcase__uses ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.misebox-ordering-showcase__uses li {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.misebox-ordering-showcase__uses li svg {
  flex: 0 0 auto;
  margin-top: 0.15rem;
  color: var(--ui-primary);
}

@media (min-width: 640px) {
  .misebox-ordering-showcase {
    padding-block: calc(var(--spacing) * 14);
  }

  .misebox-ordering-showcase__selector {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .misebox-ordering-showcase__presentation {
    grid-template-columns: minmax(28rem, 1.05fr) minmax(26rem, 0.95fr);
    align-items: start;
    gap: calc(var(--spacing) * 12);
  }

  .misebox-ordering-showcase__literature {
    position: sticky;
    top: calc(var(--spacing) * 24);
  }
}
</style>
