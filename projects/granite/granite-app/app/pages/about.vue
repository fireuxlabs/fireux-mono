<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-default bg-default/70 py-16"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.aboutLabel }}
          </p>
          <h1 class="text-4xl font-semibold text-highlighted">
            {{ appSpec.tagline }}
          </h1>
          <p class="text-lg text-toned">
            {{ appSpec.description }}
          </p>
          <p class="text-sm text-toned">
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
          <p class="text-2xl font-semibold text-primary">
            {{ appMeta.aboutPanelTitle }}
          </p>
          <p class="mb-4 text-lg font-semibold text-primary">
            {{ appMeta.aboutPanelSubtitle }}
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
            <ol class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
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
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.aboutSections.modulesEyebrow }}
          </p>
          <h2 class="text-3xl font-semibold text-highlighted">
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
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.aboutSections.entitiesEyebrow }}
          </p>
          <h2 class="text-3xl font-semibold text-highlighted">
            {{ appMeta.aboutSections.entitiesTitle }}
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <article
            v-for="entity in appSpec.entities"
            :key="entity.name"
            class="rounded-2xl border border-default bg-default/80 p-6 shadow-sm"
          >
            <h3 class="text-lg font-semibold text-highlighted">
              {{ entity.name }}
            </h3>
            <p class="mt-2 text-sm text-toned">
              {{ entity.purpose }}
            </p>
            <p class="mt-3 text-sm text-toned">
              <span class="font-semibold text-highlighted">Key fields:</span>
              {{ entity.keyFields.join(', ') }}
            </p>
            <p class="mt-2 text-sm text-toned">
              <span class="font-semibold text-highlighted">Links to:</span>
              {{ entity.linksTo.join(', ') }}
            </p>
          </article>
        </div>
      </UContainer>
    </section>

    <section class="bg-gray-50/80 py-16 dark:bg-gray-900/40">
      <UContainer class="space-y-8">
        <div class="space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.aboutSections.structureEyebrow }}
          </p>
          <h2 class="text-3xl font-semibold text-highlighted">
            {{ appMeta.aboutSections.structureTitle }}
          </h2>
        </div>

        <UCard>
          <pre class="overflow-x-auto rounded-sm bg-default p-4 text-xs leading-6">{{ relationshipMap }}</pre>
        </UCard>

        <div class="space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {{ appMeta.aboutSections.examplesEyebrow }}
          </p>
          <h2 class="text-3xl font-semibold text-highlighted">
            {{ appMeta.aboutSections.examplesTitle }}
          </h2>
        </div>

        <UCard>
          <UAccordion type="multiple" class="space-y-2">
            <UAccordionItem
              v-for="(sample, index) in appSpec.samples"
              :key="`${sample.entity}-${index}`"
              :value="`sample-${index}`"
              :title="sample.entity"
            >
              <template #body>
                <pre class="overflow-x-auto rounded-sm bg-default p-4 text-xs leading-6">{{ jsonOf(sample.example) }}</pre>
              </template>
            </UAccordionItem>
          </UAccordion>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-highlighted">
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
  samples: ReadonlyArray<{ entity: string; example: Record<string, any> }>
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
  samples: appMeta.samples,
  routes: appMeta.routes,
}
const relationshipMap = appMeta.relationshipMap

const jsonOf = (value: Record<string, any>) => JSON.stringify(value, null, 2)
</script>
