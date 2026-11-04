export const fireuxDocsCatalogue = [
  {
    slug: 'create-shell',
    name: 'FireCreateShell',
    description: 'Give a create form separate Write and Preview tabs.',
    usage: 'Use the write and preview slots for your content. Handle submit and clear in your page.',
  },
  {
    slug: 'editable-checkbox',
    name: 'FireFormsEditableCheckbox',
    description: 'Edit an on or off setting in place.',
    usage: 'Pass a label, the current value, and an update function that saves the new value.',
  },
  {
    slug: 'editable-image-picker',
    name: 'FireFormsEditableImagePicker',
    description: 'Preview an image and let people choose a replacement.',
    usage: 'Pass an image URL and alternative text. Your update function receives the selected file.',
  },
  {
    slug: 'editable-select',
    name: 'FireFormsEditableSelect',
    description: 'Edit a value from a short list of options.',
    usage: 'Pass a label, the current value, options, and an update function that saves the selection.',
  },
  {
    slug: 'onboarding-system',
    name: 'FireOnboardingShell',
    description: 'Show a step in a guided setup.',
    usage: 'Pass the setup family and current step. Supply the step content in the default slot.',
  },
] as const

export function findFireuxDocsCatalogueEntry(slug: string) {
  return fireuxDocsCatalogue.find((entry) => entry.slug === slug)
}
