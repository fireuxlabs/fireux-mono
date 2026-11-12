// Explicit public library. Nuxt component registration alone does not publish a component.
export const publicComponents = [
  {
    name: 'FireState',
    source: 'components/molecules/State.vue',
    group: 'Feedback',
    description: 'Show loading, empty and error states.',
  },
  {
    name: 'FireCopyError',
    source: 'components/molecules/CopyError.vue',
    group: 'Feedback',
    description: 'Let people copy an error for support.',
  },
  {
    name: 'FireActionSurface',
    source: 'components/molecules/ActionSurface.vue',
    group: 'Surfaces',
    description: 'Make a card surface a keyboard-accessible action.',
  },
  {
    name: 'FireDisclosureCard',
    source: 'components/molecules/DisclosureCard.vue',
    group: 'Surfaces',
    description: 'Reveal supporting content inside a card.',
  },
  {
    name: 'FireDisclosurePanel',
    source: 'components/molecules/DisclosurePanel.vue',
    group: 'Surfaces',
    description: 'Reveal supporting content beneath a labelled trigger.',
  },
  {
    name: 'FireMultiSelect',
    source: 'components/molecules/MultiSelect.vue',
    group: 'Selection',
    description: 'Pick several options from a short visible list.',
  },
  {
    name: 'FireCollectionCell',
    source: 'components/Collection/Cell.vue',
    group: 'Collections',
    description: 'Present a record summary with its destination and badges.',
  },
  {
    name: 'FireCollectionHeader',
    source: 'components/Collection/Header.vue',
    group: 'Collections',
    description: 'Give a collection a heading and controls.',
  },
  {
    name: 'FireCollectionPagination',
    source: 'components/Collection/Pagination.vue',
    group: 'Collections',
    description: 'Request more records and show paging errors.',
  },
  {
    name: 'FireCollectionRow',
    source: 'components/Collection/Row.vue',
    group: 'Collections',
    description: 'Arrange a record label, value and actions in a row.',
  },
  {
    name: 'FireContextEditor',
    source: 'components/Context/Editor.vue',
    group: 'Editing',
    description:
      'Edit background text using values and commands supplied by its owner.',
  },
  {
    name: 'FireCreateShell',
    source: 'components/Create/Shell.vue',
    group: 'Flows',
    description: 'Arrange a create form with Write and Preview tabs.',
  },
  {
    name: 'FireFormsEditableSimpleField',
    source: 'components/molecules/forms/editable/SimpleField.vue',
    group: 'Editing',
    description: 'Edit saved text with save, cancel and error states.',
  },
  {
    name: 'FireFormsEditableCheckbox',
    source: 'components/molecules/forms/editable/Checkbox.vue',
    group: 'Editing',
    description: 'Edit a saved on or off value.',
  },
  {
    name: 'FireFormsEditableSelect',
    source: 'components/molecules/forms/editable/Select.vue',
    group: 'Editing',
    description: 'Edit a saved value from a short list.',
  },
  {
    name: 'FireFormsEditableChoiceGroup',
    source: 'components/molecules/forms/editable/ChoiceGroup.vue',
    group: 'Editing',
    description: 'Edit several saved choices.',
  },
  {
    name: 'FireFormsEditableArrayOfStrings',
    source: 'components/molecules/forms/editable/ArrayOfStrings.vue',
    group: 'Editing',
    description: 'Edit a saved list of text values.',
  },
  {
    name: 'FireFormsEditableObjectArray',
    source: 'components/molecules/forms/editable/ObjectArray.vue',
    group: 'Editing',
    description: 'Edit repeated records using a supplied field definition.',
  },
  {
    name: 'FireFormsEditableImagePicker',
    source: 'components/molecules/forms/editable/ImagePicker.vue',
    group: 'Editing',
    description:
      'Choose an image while the consuming feature owns upload and save.',
  },
  {
    name: 'FireOnboardingShell',
    source: 'components/Onboarding/Shell.vue',
    group: 'Flows',
    description:
      'Arrange a guided setup step with owner-supplied content and actions.',
  },
  {
    name: 'FireDiagnosticsDebugPanel',
    source: 'components/Diagnostics/DebugPanel.vue',
    group: 'Development',
    description:
      'Inspect supplied objects and derived values during development.',
  },
]
