export const fireuxDocsCatalogue = [
  {
    slug: 'create-shell',
    title: 'Create shell',
    group: 'Flows',
    source: 'Create/Shell.vue',
    example: `<FireCreateShell @submit="createRecord" @clear="clearDraft">
  <template #write><UTextarea v-model="draft" /></template>
  <template #preview>{{ draft }}</template>
</FireCreateShell>`,
    name: 'FireCreateShell',
    description: 'Give a create form separate Write and Preview tabs.',
    usage:
      'Use the write and preview slots for your content. Handle submit and clear in your page.',
  },
  {
    slug: 'editable-text',
    title: 'Editable text',
    group: 'Editing',
    source: 'molecules/forms/editable/SimpleField.vue',
    example: `<FireFormsEditableSimpleField
  label="Display name"
  :value="displayName"
  :update="saveDisplayName"
/>`,
    name: 'FireFormsEditableSimpleField',
    description: 'Show a saved text value and let people edit it in place.',
    usage:
      'Pass the saved value and an update callback. FireUX handles the edit, save, cancel, and error states. Your App supplies validation and the command that saves the value.',
  },
  {
    slug: 'editable-checkbox',
    title: 'Editable checkbox',
    group: 'Editing',
    source: 'molecules/forms/editable/Checkbox.vue',
    example: `<FireFormsEditableCheckbox
  label="Public profile"
  :value="isPublic"
  :update="saveVisibility"
/>`,
    name: 'FireFormsEditableCheckbox',
    description: 'Edit an on or off setting in place.',
    usage:
      'Pass a label, the current value, and an update function that saves the new value.',
  },
  {
    slug: 'editable-image-picker',
    title: 'Editable image',
    group: 'Editing',
    source: 'molecules/forms/editable/ImagePicker.vue',
    example: `<FireFormsEditableImagePicker
  :src="imageUrl"
  alt="Profile image"
  :update="uploadAndSaveImage"
/>`,
    name: 'FireFormsEditableImagePicker',
    description: 'Preview an image and let people choose a replacement.',
    usage:
      'Pass the current image URL and alternative text. Your update function receives the selected file and owns upload and save. This example shows the selected filename.',
  },
  {
    slug: 'editable-select',
    title: 'Editable select',
    group: 'Editing',
    source: 'molecules/forms/editable/Select.vue',
    example: `<FireFormsEditableSelect
  label="Status"
  :value="status"
  :options="[{ label: 'Active', value: 'active' }, { label: 'Draft', value: 'draft' }]"
  :update="saveStatus"
/>`,
    name: 'FireFormsEditableSelect',
    description: 'Edit a value from a short list of options.',
    usage:
      'Pass a label, the current value, options, and an update function that saves the selection.',
  },
  {
    slug: 'onboarding-system',
    title: 'Onboarding shell',
    group: 'Flows',
    source: 'Onboarding/Shell.vue',
    example: `<FireOnboardingShell family="profile" :stage="stage">
  <template #intro>Set up your profile</template>
  <ProfileSetupStep />
  <template #footer><UButton @click="next">Continue</UButton></template>
</FireOnboardingShell>`,
    name: 'FireOnboardingShell',
    description: 'Show a step in a guided setup.',
    usage:
      'Pass the setup family and current step. Supply the step content in the default slot.',
  },
] as const

export function findFireuxDocsCatalogueEntry(slug: string) {
  return fireuxDocsCatalogue.find((entry) => entry.slug === slug)
}
