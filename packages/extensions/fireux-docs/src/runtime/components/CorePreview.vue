<template>
  <div class="core-preview">
    <div v-if="name === 'FireState'">
      <FireState
        :outcome="readOutcome"
        entity="records"
        retryable
        @retry="readOutcome = 'empty'"
      /><UButton
        label="Show error"
        color="neutral"
        variant="outline"
        @click="readOutcome = 'error'"
      />
    </div>
    <div v-else-if="name === 'FireStateCard'">
      <FireStateCard state="empty" entity="record" />
    </div>
    <div v-else-if="name === 'FireCopyError'">
      <FireCopyError message="This is a sample error message." />
    </div>
    <div v-else-if="name === 'FireActionSurface'">
      <FireActionSurface action @activate="count++"
        >Activate this surface</FireActionSurface
      >
      <p>Activated {{ count }} times.</p>
    </div>
    <div v-else-if="name === 'FireDisclosureCard'">
      <FireDisclosureCard
        title="Record details"
        description="Open this card"
        icon="i-lucide-info"
        ><p>Details supplied by the parent.</p></FireDisclosureCard
      >
    </div>
    <div v-else-if="name === 'FireDisclosurePanel'">
      <FireDisclosurePanel title="More information"
        ><p>Optional supporting content.</p></FireDisclosurePanel
      >
    </div>
    <div v-else-if="name === 'FireMultiSelect'">
      <FireMultiSelect
        v-model="choices"
        label="Choose features"
        :items="options"
      />
      <p>Selected: {{ choices.join(', ') || 'none' }}</p>
    </div>
    <div v-else-if="name === 'FireCollectionCell'">
      <FireCollectionCell
        :cell="{
          title: 'Example record',
          description: 'A shared collection cell',
          to: '#preview',
          badges: ['Active'],
        }"
      />
    </div>
    <div v-else-if="name === 'FireCollectionHeader'">
      <FireCollectionHeader title="Records" description="A collection heading"
        ><template #controls
          ><UButton label="Add record" @click="count++" /></template
      ></FireCollectionHeader>
    </div>
    <div v-else-if="name === 'FireCollectionPagination'">
      <FireCollectionPagination has-more @load-more="count++" />
      <p>Load more requested {{ count }} times.</p>
    </div>
    <div v-else-if="name === 'FireCollectionRow'">
      <FireCollectionRow
        ><span>Example record</span><template #value>CHF 12</template
        ><template #actions
          ><UButton label="Edit" variant="ghost" @click="count++" /></template
      ></FireCollectionRow>
    </div>
    <div v-else-if="name === 'FireContextEditor'">
      <FireContextEditor
        title="Background"
        :value="text"
        ready
        @update="text = $event"
      />
    </div>
    <div v-else-if="name === 'FireCreateShell'">
      <FireCreateShell
        submit-label="Preview action"
        @submit="count++"
        @clear="text = ''"
        ><template #write
          ><UTextarea v-model="text" aria-label="Draft" /></template
        ><template #preview
          ><p>{{ text }}</p></template
        ></FireCreateShell
      >
      <p>Submitted {{ count }} times. Nothing is saved.</p>
    </div>
    <div v-else-if="name === 'FireFormsTop'">
      <FireFormsTop
        label="Display name"
        :is-editing="editing"
        has-data
        @start-editing="editing = true"
        @check="editing = false"
        @cancel="editing = false"
      />
    </div>
    <div v-else-if="name === 'FireFormsEditableSimpleField'">
      <FireFormsEditableSimpleField
        label="Display name"
        :value="text"
        :update="saveText"
      />
    </div>
    <div v-else-if="name === 'FireFormsEditableCheckbox'">
      <FireFormsEditableCheckbox
        label="Public profile"
        :value="enabled"
        :update="saveEnabled"
      />
    </div>
    <div v-else-if="name === 'FireFormsEditableSelect'">
      <FireFormsEditableSelect
        label="Status"
        :value="selection"
        :options="options"
        :update="saveSelection"
      />
    </div>
    <div v-else-if="name === 'FireFormsEditableChoiceGroup'">
      <FireFormsEditableChoiceGroup
        label="Features"
        :value="choices"
        :options="options"
        :update="saveChoices"
      />
    </div>
    <div v-else-if="name === 'FireFormsEditableArrayOfStrings'">
      <FireFormsEditableArrayOfStrings
        label="Tags"
        :value="tags"
        :update="saveTags"
      />
    </div>
    <div v-else-if="name === 'FireFormsEditableObjectArray'">
      <FireFormsEditableObjectArray
        label="Records"
        :value="records"
        :fields="[{ key: 'title', label: 'Title', type: 'text' }]"
        :update="saveRecords"
        :sort-by-date="false"
      />
    </div>
    <div v-else-if="name === 'FireFormsEditableImagePicker'">
      <FireFormsEditableImagePicker
        initials="FX"
        alt="Example profile"
        :update="selectFile"
      />
      <p v-if="filename">Selected {{ filename }}. Nothing is uploaded.</p>
    </div>
    <div v-else-if="name === 'FireFormsEditableListActions'">
      <FireFormsEditableListActions
        :items="[
          {
            id: 'sample',
            title: 'Example person',
            subtitle: 'Pending request',
          },
        ]"
        :action-approve="localAction"
        :action-reject="localAction"
      />
      <p>Actions taken: {{ count }}</p>
    </div>
    <div v-else-if="name === 'FireOnboardingShell'">
      <FireOnboardingShell
        family="example"
        :stage="{
          id: 'identity',
          title: 'Identity',
          number: 1,
          count: 3,
          progress: 33,
          error: '',
        }"
        ><template #intro><p>Set up your workspace</p></template
        ><UInput v-model="text" aria-label="Workspace name" /><template #footer
          ><UButton label="Continue" @click="count++" /></template
      ></FireOnboardingShell>
    </div>
    <div v-else-if="name === 'FireDiagnosticsDebugPanel'">
      <FireDiagnosticsDebugPanel
        :objects="{ sample: { name: 'Example', status: 'draft' } }"
        :derived="{}"
        :launcher="false"
        :include-route="false"
        default-open
      />
    </div>
    <div v-else-if="name === 'FireDiagnosticsModel'">
      <FireDiagnosticsModel
        title="Example model"
        :model="{ name: '', active: true, tags: [] }"
      />
    </div>
    <div v-else-if="name === 'FireDiagnosticsFireuxDebugValue'">
      <FireDiagnosticsFireuxDebugValue
        name="example"
        :value="{ name: 'Sample', count: 3, active: true }"
        expanded
      />
    </div>
    <div v-else-if="name === 'FireDiagnosticsFireuxDebugDrift'">
      <FireDiagnosticsFireuxDebugDrift
        :findings="[]"
        :missing-count="0"
        :extra-count="0"
        :deprecated-count="0"
        :contract-names="['Example']"
        has-contracts
      />
    </div>
    <div v-else-if="name === 'FireDiagnosticsDriftToolbar'">
      <FireDiagnosticsDriftToolbar
        drift-kind="extra"
        selected-field="all"
        :filter-options="[{ label: 'All', value: 'all' }]"
        :copy-payload="{ sample: true }"
      />
    </div>
    <div v-else-if="name === 'FireDashboardOverviewEcosystem'">
      <FireDashboardOverviewEcosystem
        name="Example"
        :profile-entries="[]"
        :show-directory-action="false"
      />
    </div>
    <div v-else-if="name === 'FireDashboardOverviewApp'">
      <FireDashboardOverviewApp
        app-name="Example App"
        app-outcome="ready"
        :membership="null"
        membership-outcome="empty"
        :profile-entries="[]"
        :can-open-workspace="false"
        workspace-path="#preview"
        workspace-label="Workspace"
        workspace-icon="i-lucide-layout-dashboard"
        :can-manage-app="false"
      />
    </div>
    <div v-else-if="name === 'FireLegalBrowserStorage'">
      <FireLegalBrowserStorage />
    </div>
    <div v-else-if="name === 'FireLegalPrivacyPolicy'">
      <FireLegalPrivacyPolicy />
    </div>
    <div v-else-if="name === 'FireLegalTermsOfService'">
      <FireLegalTermsOfService />
    </div>
    <div v-else-if="name === 'FireLegalDocuments'"><FireLegalDocuments /></div>
    <div v-else-if="name === 'FireLibraryCTA'"><FireLibraryCTA /></div>
    <div v-else-if="name === 'FireLibraryDesignColors'">
      <FireLibraryDesignColors />
    </div>
    <div v-else-if="name === 'FireLibraryDesignContracts'">
      <FireLibraryDesignContracts />
    </div>
    <div v-else-if="name === 'FireLibraryDesignTokens'">
      <FireLibraryDesignTokens />
    </div>
    <div v-else-if="name === 'FireLibraryDesignTypography'">
      <FireLibraryDesignTypography />
    </div>
    <div v-else-if="name === 'FireLibraryUI'"><FireLibraryUI /></div>
    <div v-else-if="name === 'FireLandingCardGrid'">
      <FireLandingCardGrid
        title="Explore"
        :items="[
          {
            title: 'Example feature',
            description: 'A reusable landing card',
            icon: 'i-lucide-flame',
            to: '#preview',
          },
        ]"
      />
    </div>
    <div v-else-if="name === 'FireLandingCardOrbit'">
      <FireLandingCardOrbit
        :items="[
          { id: 'one', label: 'First' },
          { id: 'two', label: 'Second' },
          { id: 'three', label: 'Third' },
        ]"
        data-source="demo"
        :autoplay="false"
        :mobile-autoplay="false"
      />
    </div>
    <div v-else-if="name === 'FireLandingDirectoryHome'">
      <FireLandingDirectoryHome
        eyebrow="Explore"
        title="Example directory"
        description="Browse the available records"
        icon="i-lucide-grid-2x2"
        workspace-title="Your workspace"
        workspace-description="Manage your records"
        workspace-to="#preview"
      />
    </div>
    <div v-else-if="name === 'FireLandingOperationRail'">
      <FireLandingOperationRail
        :ariaLabel="'Example operations'"
        :operations="[
          {
            id: 'edit',
            title: 'Edit records',
            icon: 'i-lucide-pencil',
            to: '#preview',
          },
        ]"
      />
    </div>
    <div v-else-if="name === 'FireLandingPricingStrip'">
      <FireLandingPricingStrip :ariaLabel="'Example plans'" :plans="plans" />
    </div>
    <div v-else-if="name === 'FireLandingProductPricingStrip'">
      <FireLandingProductPricingStrip app-name="Example" :plans="plans" />
    </div>
    <div v-else-if="name === 'FireLandingProductCatalogue'">
      <FireLandingProductCatalogue
        :content="{
          sectionId: 'sample-catalogue',
          eyebrow: 'Explore',
          title: 'Example catalogue',
          items: [
            {
              id: 'one',
              title: 'Example product',
              description: 'A sample product card',
              to: '#preview',
            },
          ],
        }"
      />
    </div>
    <div v-else-if="name === 'FireLandingProductEntryPaths'">
      <FireLandingProductEntryPaths
        :content="{
          sectionId: 'sample-paths',
          eyebrow: 'Ignight',
          title: 'Choose a path',
          paths: [
            {
              id: 'start',
              kind: 'start',
              title: 'Create',
              description: 'Create a workspace',
              action: { label: 'Create', to: '#preview' },
            },
            {
              id: 'join',
              kind: 'join',
              title: 'Join',
              description: 'Join your team',
              action: { label: 'Join', to: '#preview' },
            },
          ],
        }"
      />
    </div>
    <div v-else-if="name === 'FireLandingProductHeroImage'">
      <FireLandingProductHeroImage :src="sampleImage" alt="Example landscape" />
    </div>
    <div v-else-if="name === 'FireLandingProductIndex'">
      <FireLandingProductIndex
        :content="{
          hero: {
            title: 'Your next idea',
            accent: 'Ignight',
            description: 'A product landing composition with sample copy',
            primaryAction: { label: 'Explore', to: '#preview' },
            secondaryAction: { label: 'Learn more', to: '#preview' },
            trustItems: ['Nuxt', 'Nuxt UI', 'FireUX'],
          },
        }"
        :section-dwell="false"
        ><template #hero-preview
          ><p>Product preview</p></template
        ></FireLandingProductIndex
      >
    </div>
    <div v-else-if="name === 'FireLandingProductProofSection'">
      <FireLandingProductProofSection
        section-id="sample-proof"
        eyebrow="Why it helps"
        title="Useful shared behavior"
        description="A reusable product section"
        :items="['Simple inputs', 'Clear ownership']"
        ><UCard>Preview content</UCard></FireLandingProductProofSection
      >
    </div>
    <div v-else-if="name === 'FireLandingProductSurfaceShowcase'">
      <FireLandingProductSurfaceShowcase
        :items="[
          {
            id: 'one',
            title: 'Overview',
            description: 'An example product surface',
            icon: 'i-lucide-layout-dashboard',
            to: '#preview',
            action: 'Explore',
          },
        ]"
      />
    </div>
    <div v-else-if="name === 'FireLandingSkillsIcons'">
      <CoreLandingSkillsIcons
        :skills="[
          { icon: 'i-lucide-flame', label: 'FireUX' },
          { icon: 'i-lucide-code', label: 'Nuxt' },
        ]"
      />
    </div>
    <div v-else-if="name === 'FireLandingWorkspacePreviewFrame'">
      <FireLandingWorkspacePreviewFrame
        v-model="workspaceTab"
        :items="[
          { id: 'overview', title: 'Overview', icon: 'i-lucide-home' },
          { id: 'records', title: 'Records', icon: 'i-lucide-list' },
        ]"
        label="Example workspace"
        navigation-label="Example navigation"
        workspace-to="#preview"
        ><p>Selected: {{ workspaceTab }}</p></FireLandingWorkspacePreviewFrame
      >
    </div>
    <div v-else-if="name === 'WorkspaceSelectionRow'">
      <WorkspaceSelectionRow :selected="enabled" @select="enabled = !enabled"
        >Example workspace</WorkspaceSelectionRow
      >
    </div>
    <div v-else-if="name === 'WorkspaceFormActions'">
      <form @submit.prevent="count++">
        <WorkspaceFormActions :status="`Saved locally ${count} times`" />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CoreLandingSkillsIcons from 'fireux-core/runtime/components/landing/SkillsIcons.vue'

defineProps<{ name: string }>()
const count = ref(0)
const text = ref('Example record')
const enabled = ref(true)
const editing = ref(false)
const selection = ref('active')
const choices = ref(['active'])
const tags = ref(['Design', 'Development'])
const records = ref([{ title: 'First record' }])
const filename = ref('')
const workspaceTab = ref('overview')
const readOutcome = ref<'empty' | 'error'>('empty')
const options = [
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
]
const plans = [
  {
    id: 'free',
    title: 'Free',
    description: 'Example plan',
    price: 'CHF 0',
    features: ['Explore the basics'],
  },
]
const sampleImage =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="800" height="450" fill="#293348"/><path d="M0 450 260 130 480 350 650 180 800 450" fill="#f59e0b"/></svg>'
  )
const saveText = (value: string) => {
  text.value = value
}
const saveEnabled = (value: boolean) => {
  enabled.value = value
}
const saveSelection = (value: string) => {
  selection.value = value
}
const saveChoices = (value: string[]) => {
  choices.value = value
}
const saveTags = (value: string[]) => {
  tags.value = value
}
const saveRecords = (value: { title: string }[]) => {
  records.value = value
}
const selectFile = (file: File) => {
  filename.value = file.name
}
const localAction = async () => {
  count.value++
}
</script>

<style scoped>
.core-preview {
  min-width: 0;
  overflow: auto;
}
.core-preview > div {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
</style>
