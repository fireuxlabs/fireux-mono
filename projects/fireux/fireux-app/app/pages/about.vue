<!-- Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: remove stale sample-object presentation. -->
<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section>
      <UContainer>
        <div class="pagebody">
          <p class="fx-type-headline">
            {{ appMeta.aboutLabel }}
          </p>
          <h1 class="fx-type-display-title">
            {{ appSpec.tagline }}
          </h1>
          <p class="fx-type-description">
            {{ appSpec.description }}
          </p>
          <p class="fx-type-caption">
            {{ appMeta.aboutSupportingCopy }}
          </p>
          <div class="fx-card__actions">
            <UButton
              :to="appMeta.aboutPrimaryAction.to"
              color="primary"
              size="lg"
            >
              {{ appMeta.aboutPrimaryAction.label }}
            </UButton>
            <UButton
              :to="appMeta.aboutSecondaryAction.to"
              color="neutral"
              variant="ghost"
              size="lg"
            >
              {{ appMeta.aboutSecondaryAction.label }}
            </UButton>
          </div>
        </div>

        <UCard>
          <p class="fx-type-label">
            {{ appMeta.aboutPanelTitle }}
          </p>
          <ul class="fx-list-stack">
            <li v-for="tick in appMeta.aboutPanelTicks" :key="tick">
              <UIcon name="i-lucide-check" />
              <span>{{ tick }}</span>
            </li>
          </ul>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UCard>
          <div class="fx-card-body-stack">
            <h2 class="fx-type-section-title">
              {{ appMeta.aboutSections.keyConceptsTitle }}
            </h2>
            <ol class="fx-list-stack">
              <li
                v-for="(concept, index) in appMeta.keyConcepts"
                :key="concept.title"
              >
                <span>{{ index + 1 }}. {{ concept.title }}</span
                ><br />
                {{ concept.description }}
              </li>
            </ol>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="pagebody">
          <p class="fx-type-headline">
            {{ appMeta.aboutSections.modulesEyebrow }}
          </p>
          <h2 class="fx-type-section-title">
            {{ appMeta.aboutSections.modulesTitle }}
          </h2>
          <p class="fx-type-body">
            {{ appMeta.aboutSections.modulesDescription }}
          </p>
        </div>

        <UCard>
          <UAccordion type="multiple">
            <UAccordionItem
              v-for="(module, index) in appSpec.modules"
              :key="module.name"
              :value="`module-${index}`"
              :title="module.name"
            >
              <template #body>
                <div class="pagebody">
                  <p class="fx-type-body">{{ module.summary }}</p>
                  <div class="card__badges">
                    <UBadge
                      v-for="entityName in module.entities"
                      :key="`${module.name}-${entityName}`"
                      color="neutral"
                      variant="soft"
                    >
                      {{ entityName }}
                    </UBadge>
                  </div>
                </div>
              </template>
            </UAccordionItem>
          </UAccordion>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="pagebody">
          <p class="fx-type-headline">
            {{ appMeta.aboutSections.entitiesEyebrow }}
          </p>
          <h2 class="fx-type-section-title">
            {{ appMeta.aboutSections.entitiesTitle }}
          </h2>
        </div>

        <UPageGrid>
          <UCard
            as="article"
            v-for="entity in appSpec.entities"
            :key="entity.name"
          >
            <h3 class="fx-type-card-heading">
              {{ entity.name }}
            </h3>
            <p class="fx-type-caption">
              {{ entity.purpose }}
            </p>
            <p class="fx-type-caption">
              <span>Key fields:</span>
              {{ entity.keyFields.join(', ') }}
            </p>
            <p class="fx-type-caption">
              <span>Links to:</span>
              {{ entity.linksTo.join(', ') }}
            </p>
          </UCard>
        </UPageGrid>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="pagebody">
          <p class="fx-type-headline">
            {{ appMeta.aboutSections.structureEyebrow }}
          </p>
          <h2 class="fx-type-section-title">
            {{ appMeta.aboutSections.structureTitle }}
          </h2>
        </div>

        <UCard>
          <pre class="overflow-x-auto">{{ relationshipMap }}</pre>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="fx-type-card-heading">
              {{ appMeta.aboutSections.routesTitle }}
            </h3>
          </template>
          <div class="fx-card__actions">
            <UButton
              v-for="route in appSpec.routes"
              :key="route.path"
              :to="route.path"
              :icon="
                route.kind === 'workspace'
                  ? 'i-lucide-terminal'
                  : 'i-lucide-link'
              "
              :color="route.kind === 'workspace' ? 'primary' : 'neutral'"
              variant="soft"
            >
              {{ route.label }} · {{ route.path }}
            </UButton>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appMeta } from '../meta'

type AppSpec = {
  name: string
  tagline: string
  description: string
  modules: ReadonlyArray<{
    name: string
    summary: string
    entities: readonly string[]
  }>
  entities: ReadonlyArray<{
    name: string
    purpose: string
    keyFields: readonly string[]
    linksTo: readonly string[]
  }>
  routes: ReadonlyArray<{
    label: string
    path: string
    kind: 'public' | 'workspace'
  }>
}

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    order: 25,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.seoAbout.title,
  description: appMeta.seoAbout.description,
})

const appSpec: AppSpec = {
  name: appMeta.name,
  tagline: appMeta.tagline,
  description: appMeta.description,
  modules: appMeta.modules,
  entities: appMeta.entities,
  routes: appMeta.routes,
}
const relationshipMap = appMeta.relationshipMap
</script>
