<script setup lang="ts">
import { useColorMode as useFireuxColorMode } from 'fireux-core/runtime/composables/theme/useColorMode'
import { ref } from 'vue'

// Concurrent edit — 2026-07-21 12:58 CEST — CSS architecture pass: expose stable visual specimens for shared atomic contracts.
// Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: demonstrate Nuxt UI in place of one-off CSS metrics and card foundations.
definePageMeta({ layout: 'design' })
useHead({ title: 'Component Contracts · Design System' })

const activationCount = ref(0)
const contractColorMode = useFireuxColorMode()

const contractSolutions = [
  {
    slug: 'shared-css',
    title: 'Shared CSS contract',
    description:
      'One reusable visual contract supports many named domain components.',
    icon: 'i-lucide-layers-3',
    to: '/design/components/contracts',
    owner: { id: 'fireux-core', name: 'FireUX core' },
  },
  {
    slug: 'domain-delta',
    title: 'Domain-owned delta',
    description:
      'Pages and components keep their business meaning and local presentation.',
    icon: 'i-lucide-blocks',
    to: '/design/components/contracts',
    owner: { id: 'named-domain', name: 'Named domain' },
  },
]
</script>

<template>
  <div
    class="fx-page-stack fx-page-stack--compact"
    data-visual-contract="component-contracts"
  >
    <header class="contract-heading">
      <p class="fx-type-headline">Components</p>
      <h1 class="fx-type-page-title">Interaction and state contracts</h1>
      <p class="fx-type-description">
        Shared behavior stays consistent while domain content remains local.
      </p>
      <div
        class="contract-mode-controls"
        role="group"
        aria-label="Contract color mode"
      >
        <UButton
          label="Light"
          aria-label="Preview light mode"
          color="neutral"
          :variant="contractColorMode === 'light' ? 'solid' : 'soft'"
          @click="contractColorMode = 'light'"
        />
        <UButton
          label="Dark"
          aria-label="Preview dark mode"
          color="neutral"
          :variant="contractColorMode === 'dark' ? 'solid' : 'soft'"
          @click="contractColorMode = 'dark'"
        />
        <UButton
          label="System"
          aria-label="Follow system color mode"
          color="neutral"
          :variant="contractColorMode === 'system' ? 'solid' : 'soft'"
          @click="contractColorMode = 'system'"
        />
      </div>
    </header>

    <section class="contract-section" data-visual-contract="nuxt-ui-states">
      <div>
        <h2 class="fx-type-section-title">Nuxt UI states</h2>
        <p class="fx-type-caption">
          Ordinary actions use the component's native color, variant, loading,
          and disabled props.
        </p>
      </div>

      <UCard>
        <div class="contract-row">
          <UButton label="Primary action" />
          <UButton color="neutral" variant="soft" label="Secondary action" />
          <UButton loading label="Saving" />
          <UButton disabled label="Unavailable" />
        </div>
      </UCard>

      <div class="contract-grid">
        <UAlert
          color="info"
          variant="soft"
          icon="i-lucide-info"
          title="Information"
          description="Use alerts for compact notices and actionable feedback."
        />
        <UAlert
          color="warning"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="Needs attention"
          description="The domain owns the message and the next action."
        />
        <UAlert
          color="error"
          variant="soft"
          icon="i-lucide-circle-x"
          title="Action failed"
          description="Errors are not presented as empty or missing data."
        />
      </div>
    </section>

    <section class="contract-section" data-visual-contract="outcome-states">
      <div>
        <h2 class="fx-type-section-title">Outcome states</h2>
        <p class="fx-type-caption">
          Loading, empty, missing, and failed reads have distinct semantics.
        </p>
      </div>

      <div class="contract-grid contract-grid--states">
        <MoleculesStateCard entity="projects" state="loading" />
        <MoleculesStateCard entity="projects" state="empty" />
        <MoleculesStateCard entity="project" state="missing" />
        <MoleculesStateCard entity="projects" state="error" />
      </div>
    </section>

    <section class="contract-section" data-visual-contract="workflow-molecules">
      <div>
        <h2 class="fx-type-section-title">Disclosure and create workflow</h2>
        <p class="fx-type-caption">
          Shared shells own trigger behavior and rhythm, not domain fields.
        </p>
      </div>

      <div class="contract-grid">
        <MoleculesDisclosurePanel
          title="Advanced settings"
          description="Optional configuration"
          icon="i-lucide-sliders-horizontal"
          default-open
        >
          <div class="contract-content">
            <p class="fx-type-body">
              Disclosure content keeps its own layout and business meaning.
            </p>
            <UButton color="neutral" variant="outline" label="Local action" />
          </div>
        </MoleculesDisclosurePanel>

        <MoleculesCreateCard>
          <template #header>
            <div class="workspace-card-header">
              <h3 class="workspace-card-header__title">Create project</h3>
              <p class="workspace-card-header__description">
                The card supplies workflow rhythm; the project owns its fields.
              </p>
            </div>
          </template>

          <UFormField label="Name" name="name">
            <UInput model-value="Design system specimen" />
          </UFormField>
          <UButton label="Create project" />
        </MoleculesCreateCard>
      </div>
    </section>

    <section class="contract-section" data-visual-contract="action-surfaces">
      <div>
        <h2 class="fx-type-section-title">Action surfaces</h2>
        <p class="fx-type-caption">
          Entity cards resolve to a link, a real button, or static content.
        </p>
      </div>

      <div class="contract-grid contract-grid--actions">
        <MoleculesActionSurface
          action
          class="fx-card--cell"
          @activate="activationCount += 1"
        >
          <p class="fx-type-card-title">Action card</p>
          <p class="fx-type-caption">Activations: {{ activationCount }}</p>
        </MoleculesActionSurface>

        <MoleculesActionSurface class="fx-card--cell">
          <p class="fx-type-card-title">Static card</p>
          <p class="fx-type-caption">Readable, but not keyboard-actionable.</p>
        </MoleculesActionSurface>

        <MoleculesActionSurface
          to="/design/components/contracts"
          disabled
          class="fx-card--cell"
        >
          <p class="fx-type-card-title">Disabled link card</p>
          <p class="fx-type-caption">No href and no accidental navigation.</p>
        </MoleculesActionSurface>
      </div>
    </section>

    <section
      id="css-taxonomy"
      class="contract-section"
      data-visual-contract="css-taxonomy"
    >
      <div>
        <h2 class="fx-type-section-title">CSS taxonomy</h2>
        <p class="fx-type-caption">
          Atomic depth describes a shared visual contract. Vue components and
          pages remain named after their domain and route responsibility.
        </p>
      </div>

      <div class="contract-grid contract-grid--taxonomy">
        <UCard>
          <template #header>
            <div class="contract-layer-heading">
              <UBadge label="Atom" color="neutral" variant="soft" />
              <p class="fx-type-caption">One semantic visual role</p>
            </div>
          </template>

          <div class="contract-content">
            <p class="fx-type-headline">Eyebrow</p>
            <p class="fx-type-card-heading">Card heading</p>
            <p class="fx-type-body">
              Type roles use the installed Tailwind scale and Nuxt UI colors.
            </p>
            <p class="fx-type-caption">Supporting metadata</p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="contract-layer-heading">
              <UBadge label="Molecule" color="neutral" variant="soft" />
              <p class="fx-type-caption">Reusable local composition</p>
            </div>
          </template>

          <div class="contract-content">
            <div class="fx-inset-panel">
              <p class="fx-type-card-title">Inset panel</p>
              <p class="fx-type-caption">Shared border, radius, and spacing.</p>
            </div>

            <UPageFeature
              icon="i-lucide-database"
              title="24 connected records"
              description="Nuxt UI owns this compact summary presentation."
            />

            <div class="pill">
              <UIcon name="i-lucide-component" />
              <span class="fx-type-label">Entity pill</span>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="contract-layer-heading">
              <UBadge label="Organism" color="neutral" variant="soft" />
              <p class="fx-type-caption">Multi-component page pattern</p>
            </div>
          </template>

          <div class="collection-manager__header">
            <div class="collection-manager__title">
              <p class="fx-type-card-title">Collection manager</p>
              <p>Domain copy and data stay with the named component.</p>
            </div>
            <div class="collection-manager__controls">
              <UInput placeholder="Search" icon="i-lucide-search" />
              <UButton color="neutral" variant="soft" label="Filter" />
            </div>
          </div>
        </UCard>
      </div>
    </section>

    <section
      id="shared-patterns"
      class="contract-section"
      data-visual-contract="shared-organisms"
    >
      <div>
        <h2 class="fx-type-section-title">Cross-tree shared patterns</h2>
        <p class="fx-type-caption">
          These contracts recur across public components, entity cards, workspace
          surfaces, and route pages without becoming generic business shells.
        </p>
      </div>

      <PublicSolutionsGrid :solutions="contractSolutions" />

      <div class="contract-grid">
        <UCard class="fx-card--public-action">
          <div class="fx-public-action">
            <div class="fx-public-action__badges">
              <UBadge label="Public action" color="primary" variant="soft" />
            </div>
            <div class="fx-public-action__body">
              <UAvatar
                icon="i-lucide-shield-check"
                class="fx-public-action__avatar"
              />
              <div class="fx-public-action__content">
                <div class="fx-public-action__copy">
                  <h3 class="fx-public-action__title">Claim or operate</h3>
                  <p class="fx-public-action__description">
                    Company, Place, Kitchen, Portfolio, and Supplier panels
                    share this presentation contract.
                  </p>
                </div>
                <div class="fx-public-action__actions">
                  <UButton label="Primary action" />
                  <UButton color="neutral" variant="soft" label="Secondary" />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard class="profile">
          <div class="profile__header">
            <div class="profile__identity">
              <UAvatar icon="i-lucide-user-round" size="lg" />
              <div class="profile__titles">
                <p class="profile__title">Profile card</p>
                <p class="profile__subtitle">
                  Shared anatomy, domain-owned data
                </p>
              </div>
            </div>
            <div class="profile__badges">
              <UBadge label="Active" color="success" variant="soft" />
            </div>
          </div>
          <div class="profile__body">
            <div class="profile__section">
              <span class="profile__label">Responsibility</span>
              <span class="profile__value">
                Named Profile and Detail components own the actual content.
              </span>
            </div>
          </div>
        </UCard>
      </div>
    </section>
  </div>
</template>

<style scoped src="./contracts.css"></style>
