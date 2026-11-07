<template>
  <UPage v-if="entry">
    <UPageHeader
      headline="Docs · Components"
      :title="entry.title"
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
      <p>
        <code>{{ entry.name }}</code> · FireUX Core
      </p>
      <p>{{ entry.usage }}</p>

      <section class="docs-section">
        <h2 class="fx-type-section-title">Example</h2>
        <FireCreateShell
          v-if="entry.slug === 'create-shell'"
          submit-label="Create record"
        >
          <template #write
            ><UTextarea placeholder="Write the record…"
          /></template>
          <template #preview><p>Record preview</p></template>
        </FireCreateShell>

        <FireFormsEditableSimpleField
          v-else-if="entry.slug === 'editable-text'"
          label="Display name"
          :value="textValue"
          :update="updateText"
        />

        <FireFormsEditableCheckbox
          v-else-if="entry.slug === 'editable-checkbox'"
          label="Public profile"
          :value="checkboxValue"
          :update="updateCheckbox"
        />

        <template v-else-if="entry.slug === 'editable-image-picker'">
          <FireFormsEditableImagePicker
            initials="FX"
            alt="Example App"
            button-label="Choose image"
            :update="showFilename"
          />
          <p v-if="selectedFilename" role="status">
            Selected {{ selectedFilename }}
          </p>
        </template>

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
            <p>Set up your workspace</p>
            <p>The owner supplies this introduction.</p>
          </template>
          <p>The owner supplies the current step.</p>
        </FireOnboardingShell>
      </section>
      <section class="docs-section">
        <h2 class="fx-type-section-title">Usage</h2>
        <UCard variant="subtle">
          <pre class="docs-code"><code>{{ entry.example }}</code></pre>
        </UCard>
        <p>
          Supply the values and callbacks from your page. The example above uses
          local state.
        </p>
        <ULink :to="sourceUrl" target="_blank"
          >View component source and full API</ULink
        >
      </section>
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
const textValue = ref('Example App')
const updateText = (value: string) => {
  textValue.value = value
}
const sourceUrl = computed(() =>
  entry.value
    ? `https://github.com/fireuxlabs/fireux-mono/blob/main/packages/core/fireux-core/src/runtime/components/${entry.value.source}`
    : ''
)
const selectedFilename = ref('')
const showFilename = (file: File) => {
  selectedFilename.value = file.name
}
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

<style scoped>
.docs-section {
  margin-block: calc(var(--spacing) * 8);
}

.docs-section h2 {
  margin-bottom: calc(var(--spacing) * 4);
  font-size: 1.25rem;
  font-weight: 600;
}

.docs-code {
  overflow-x: auto;
  white-space: pre;
}
</style>
