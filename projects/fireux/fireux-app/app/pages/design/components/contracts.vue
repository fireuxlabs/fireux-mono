<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'design' })
useHead({ title: 'Component Contracts · Design System' })

const activationCount = ref(0)
</script>

<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <header class="contract-heading">
      <p class="fx-type-headline">Components</p>
      <h1 class="fx-type-page-title">Interaction and state contracts</h1>
      <p class="fx-type-description">
        Shared behavior stays consistent while domain content remains local.
      </p>
    </header>

    <section class="contract-section">
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

    <section class="contract-section">
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

    <section class="contract-section">
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
            <div class="console-card-header">
              <h3 class="console-card-header__title">Create project</h3>
              <p class="console-card-header__description">
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

    <section class="contract-section">
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
  </div>
</template>

<style scoped>
.contract-heading,
.contract-section,
.contract-content {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.contract-section {
  gap: calc(var(--spacing) * 6);
}

.contract-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
}

.contract-row {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
}

.contract-grid--actions > * {
  width: 100%;
  text-align: left;
}

@media (min-width: 768px) {
  .contract-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .contract-grid--actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
