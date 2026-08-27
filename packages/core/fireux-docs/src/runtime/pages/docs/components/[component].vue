<template>
  <UPage v-if="entry">
    <UPageHeader
      headline="Docs · Components"
      :title="entry.name"
      :description="entry.description"
    >
      <template #links>
        <UButton
          to="/docs/components"
          label="All components"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
        />
      </template>
    </UPageHeader>

    <UPageBody class="space-y-8">
      <UCard>
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold">{{ entry.owner }}</p>
            <p class="text-sm text-dimmed">
              Cross-industry · {{ entry.responsibility }}
            </p>
          </div>
          <UBadge :color="review.color" variant="soft">
            {{ review.label }}
          </UBadge>
        </div>
        <ul class="fx-list-stack mt-4 text-sm text-dimmed">
          <li v-for="reason in review.reasons" :key="reason">{{ reason }}</li>
        </ul>
      </UCard>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Preview</h2>
        <CollectionPage
          v-if="entry.slug === 'entity-collection-page'"
          eyebrow="Discover"
          title="Apps"
          description="Find apps in this ecosystem, or start your app."
          icon="i-lucide-app-window"
          secondary-label="Your Apps"
        >
          <UCard>Primary page-owned collection child</UCard>

          <template #secondary>
            <UCard>Secondary page-owned action child</UCard>
          </template>
        </CollectionPage>

        <MoleculesActionSurface
          v-else-if="entry.slug === 'action-surface'"
          action
          class="rounded-xl border border-default bg-elevated p-6"
        >
          <p class="font-semibold">Action surface</p>
          <p class="text-sm text-dimmed">This whole surface is one action.</p>
        </MoleculesActionSurface>

        <div
          v-else-if="entry.slug === 'state-card'"
          class="grid gap-4 md:grid-cols-2"
        >
          <MoleculesStateCard entity="apps" state="empty" />
          <MoleculesStateCard entity="app" kind="document" state="missing" />
        </div>

        <CreateShell
          v-else-if="entry.slug === 'create-shell'"
          submit-label="Create record"
        >
          <template #write
            ><UTextarea placeholder="Write the record…"
          /></template>
          <template #preview
            ><p class="text-sm text-dimmed">Record preview</p></template
          >
        </CreateShell>

        <MoleculesFormsEditableCheckbox
          v-else-if="entry.slug === 'editable-checkbox'"
          label="Public profile"
          :value="checkboxValue"
          :update="updateCheckbox"
        />

        <MoleculesFormsEditableImagePicker
          v-else-if="entry.slug === 'editable-image-picker'"
          initials="FX"
          alt="Example App"
          button-label="Choose image"
        />

        <MoleculesFormsEditableSelect
          v-else-if="entry.slug === 'editable-select'"
          label="Status"
          value="active"
          :options="selectOptions"
          :update="updateSelect"
        />

        <OnboardingShell
          v-else-if="entry.slug === 'onboarding-system'"
          family="example"
          :stage="onboardingStage"
        >
          <template #intro>
            <p class="font-semibold">Set up your workspace</p>
            <p class="mt-2 text-sm text-dimmed">
              The owner supplies this introduction.
            </p>
          </template>
          <p class="text-sm text-dimmed">
            The owner supplies the current step.
          </p>
        </OnboardingShell>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <UCard>
          <template #header><h2 class="font-semibold">Objects</h2></template>
          <div class="space-y-4 text-sm">
            <div>
              <p class="font-medium">Fetched</p>
              <p class="text-dimmed">
                {{ entry.objects.fetched.join(', ') || 'None' }}
              </p>
            </div>
            <div>
              <p class="font-medium">Passed</p>
              <p class="text-dimmed">
                {{ entry.objects.passed.join(', ') || 'None' }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header><h2 class="font-semibold">Derived</h2></template>
          <ul class="fx-list-stack list-disc pl-5 text-sm text-dimmed">
            <li v-for="value in entry.derived" :key="value">{{ value }}</li>
          </ul>
        </UCard>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="font-semibold">Used in the repository</h2>
          </template>
          <ul class="fx-list-stack text-sm">
            <li v-for="usage in entry.usedBy" :key="usage.source">
              <UBadge color="neutral" variant="soft" class="mr-2">
                {{ usage.kind }}
              </UBadge>
              <code class="text-xs text-dimmed">{{ usage.source }}</code>
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold">Extends Nuxt UI</h2>
          </template>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="component in entry.nuxtUiChildren"
              :key="component"
              color="neutral"
              variant="soft"
            >
              {{ component }}
            </UBadge>
            <span
              v-if="!entry.nuxtUiChildren.length"
              class="text-sm text-dimmed"
            >
              No direct Nuxt UI children
            </span>
          </div>
        </UCard>
      </section>

      <UCard>
        <template #header><h2 class="font-semibold">Source</h2></template>
        <code class="text-sm text-dimmed">{{ entry.source }}</code>
      </UCard>
    </UPageBody>
  </UPage>

  <UPage v-else>
    <UPageHeader
      title="Component not found"
      description="This route is not backed by a current FireUX component catalogue entry."
    />
  </UPage>
</template>

<script setup lang="ts">
import {
  findFireuxDocsCatalogueEntry,
  reviewFireuxDocsCatalogueEntry,
} from '../../../models/catalogue'

const route = useRoute()
const componentSlug = computed(() => String(route.params.component || ''))
const entry = computed(() => findFireuxDocsCatalogueEntry(componentSlug.value))
const review = computed(() =>
  entry.value
    ? reviewFireuxDocsCatalogueEntry(entry.value)
    : { color: 'warning' as const, label: 'Review' as const, reasons: [] }
)

const checkboxValue = ref(true)
const updateCheckbox = async (value: boolean) => {
  checkboxValue.value = value
}
const selectOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
]
const updateSelect = async () => undefined
const onboardingStage = {
  id: 'identity',
  title: 'Identity',
  number: 1,
  count: 3,
  progress: 33,
  error: '',
}

if (!entry.value) setResponseStatus(404)

definePageMeta({ layout: 'docs', title: 'Component' })
useSeoMeta({
  title: computed(() =>
    entry.value ? `${entry.value.name} · FireUX Docs` : 'Component not found'
  ),
  description: computed(() => entry.value?.description || ''),
})
</script>
