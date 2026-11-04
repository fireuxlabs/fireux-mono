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

    <UPageBody>
      <p>{{ entry.usage }}</p>

      <UPageSection title="Example">
        <FireCreateShell
          v-if="entry.slug === 'create-shell'"
          submit-label="Create record"
        >
          <template #write
            ><UTextarea placeholder="Write the record…"
          /></template>
          <template #preview
            ><p class="text-sm text-dimmed">Record preview</p></template
          >
        </FireCreateShell>

        <FireFormsEditableCheckbox
          v-else-if="entry.slug === 'editable-checkbox'"
          label="Public profile"
          :value="checkboxValue"
          :update="updateCheckbox"
        />

        <FireFormsEditableImagePicker
          v-else-if="entry.slug === 'editable-image-picker'"
          initials="FX"
          alt="Example App"
          button-label="Choose image"
        />

        <FireFormsEditableSelect
          v-else-if="entry.slug === 'editable-select'"
          label="Status"
          :value="selectValue"
          :options="selectOptions"
          :update="updateSelect"
        />

        <FireOnboardingShell
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
        </FireOnboardingShell>
      </UPageSection>
    </UPageBody>
  </UPage>

  <UPage v-else>
    <UPageHeader
      title="Component not found"
      description="Browse the component reference to find what you need."
    />
  </UPage>
</template>

<script setup lang="ts">
import { findFireuxDocsCatalogueEntry } from '../../../models/catalogue'

const route = useRoute()
const componentSlug = computed(() => String(route.params.component || ''))
const entry = computed(() => findFireuxDocsCatalogueEntry(componentSlug.value))
const checkboxValue = ref(true)
const updateCheckbox = async (value: boolean) => {
  checkboxValue.value = value
}
const selectOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
]
const selectValue = ref('active')
const updateSelect = async (value: string) => {
  selectValue.value = value
}
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
