<!-- Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: remove stale sample-object presentation. -->
<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section
      class="border-b border-default bg-default/70 py-16"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="fx-type-headline">
            {{ appMeta.aboutLabel }}
          </p>
          <h1 class="fx-type-display-title">
            {{ appSpec.tagline }}
          </h1>
          <p class="fx-type-description text-toned">
            {{ appSpec.description }}
          </p>
          <p class="fx-type-caption text-toned">
            {{ appMeta.aboutSupportingCopy }}
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton :to="appMeta.aboutPrimaryAction.to" color="primary" size="lg">
              {{ appMeta.aboutPrimaryAction.label }}
            </UButton>
            <UButton :to="appMeta.aboutSecondaryAction.to" color="neutral" variant="ghost" size="lg">
              {{ appMeta.aboutSecondaryAction.label }}
            </UButton>
          </div>
        </div>

        <div
          class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary"
        >
          <p class="fx-type-label mb-4 text-primary">
            {{ appMeta.aboutPanelTitle }}
          </p>
          <ul class="space-y-3">
            <li
              v-for="tick in appMeta.aboutPanelTicks"
              :key="tick"
              class="flex items-start gap-3"
            >
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>{{ tick }}</span>
            </li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UCard>
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-highlighted">
              {{ appMeta.aboutSections.keyConceptsTitle }}
            </h2>
            <ol class="space-y-3 text-sm text-default">
              <li v-for="(concept, index) in appMeta.keyConcepts" :key="concept.title">
                <span class="font-semibold text-highlighted">{{ index + 1 }}. {{ concept.title }}</span><br>
                {{ concept.description }}
              </li>
            </ol>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="fx-type-headline">
            {{ appMeta.aboutSections.modulesEyebrow }}
          </p>
          <h2 class="fx-type-section-title">
            {{ appMeta.aboutSections.modulesTitle }}
          </h2>
          <p class="text-toned">
            {{ appMeta.aboutSections.modulesDescription }}
          </p>
        </div>

        <UCard>
          <UAccordion type="multiple" class="space-y-2">
            <UAccordionItem
              v-for="(module, index) in appSpec.modules"
              :key="module.name"
              :value="`module-${index}`"
              :title="module.name"
            >
              <template #body>
                <div class="space-y-3 text-sm">
                  <p class="text-toned">{{ module.summary }}</p>
                  <div class="flex flex-wrap gap-2">
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
        <div class="mb-10 space-y-2 text-center">
          <p class="fx-type-headline">
            {{ appMeta.aboutSections.entitiesEyebrow }}
          </p>
          <h2 class="fx-type-section-title">
            {{ appMeta.aboutSections.entitiesTitle }}
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <article
            v-for="entity in appSpec.entities"
            :key="entity.name"
            class="rounded-2xl border border-default bg-default/80 p-6 shadow-sm"
          >
            <h3 class="fx-type-card-heading">
              {{ entity.name }}
            </h3>
            <p class="fx-type-caption mt-2 text-toned">
              {{ entity.purpose }}
            </p>
            <p class="fx-type-caption mt-3 text-toned">
              <span class="font-semibold text-highlighted">Key fields:</span>
              {{ entity.keyFields.join(', ') }}
            </p>
            <p class="fx-type-caption mt-2 text-toned">
              <span class="font-semibold text-highlighted">Links to:</span>
              {{ entity.linksTo.join(', ') }}
            </p>
          </article>
        </div>
      </UContainer>
    </section>

    <section class="bg-muted/80 py-16">
      <UContainer class="space-y-8">
        <div class="space-y-2 text-center">
          <p class="fx-type-headline">
            {{ appMeta.aboutSections.structureEyebrow }}
          </p>
          <h2 class="fx-type-section-title">
            {{ appMeta.aboutSections.structureTitle }}
          </h2>
        </div>

        <UCard>
          <pre class="overflow-x-auto rounded-sm bg-default p-4 text-xs leading-6">{{ relationshipMap }}</pre>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="fx-type-card-heading">
              {{ appMeta.aboutSections.routesTitle }}
            </h3>
          </template>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="route in appSpec.routes"
              :key="route.path"
              :to="route.path"
              :icon="route.kind === 'console' ? 'i-lucide-terminal' : 'i-lucide-link'"
              :color="route.kind === 'console' ? 'primary' : 'neutral'"
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
  modules: ReadonlyArray<{ name: string; summary: string; entities: readonly string[] }>
  entities: ReadonlyArray<{
    name: string
    purpose: string
    keyFields: readonly string[]
    linksTo: readonly string[]
  }>
  routes: ReadonlyArray<{ label: string; path: string; kind: 'public' | 'console' }>
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
