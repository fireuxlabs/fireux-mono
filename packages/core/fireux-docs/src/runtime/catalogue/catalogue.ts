export type FireuxDocsCatalogueEntry = {
  category: 'Forms' | 'Onboarding' | 'Page' | 'Profiles' | 'Surfaces'
  componentName: string
  description: string
  derived: readonly string[]
  inputs: {
    booleanCount: number
    genericNames: readonly string[]
    ownershipGroups: readonly string[]
    propCount: number
  }
  name: string
  nuxtUiChildren: readonly string[]
  objects: { fetched: readonly string[]; passed: readonly string[] }
  owner: string
  responsibility: string
  scope: 'cross-industry'
  slug: string
  source: string
  usedBy: ReadonlyArray<{ kind: 'component' | 'page'; source: string }>
}

type MoleculeEntry = {
  booleans?: number
  category: FireuxDocsCatalogueEntry['category']
  children: string[]
  componentName: string
  description: string
  derived: string
  name: string
  passed: string[]
  props: number
  responsibility: string
  slug: string
  source: string
  uses: FireuxDocsCatalogueEntry['usedBy']
}

const molecule = (entry: MoleculeEntry): FireuxDocsCatalogueEntry => ({
  ...entry,
  derived: [entry.derived],
  inputs: {
    booleanCount: entry.booleans ?? 0,
    genericNames: [],
    ownershipGroups: [entry.responsibility],
    propCount: entry.props,
  },
  nuxtUiChildren: entry.children,
  objects: { fetched: [], passed: entry.passed },
  owner: `Molecules · ${entry.category}`,
  scope: 'cross-industry',
  usedBy: entry.uses,
})

const component = (source: string) => ({ kind: 'component' as const, source })
const page = (source: string) => ({ kind: 'page' as const, source })
const core = (path: string) =>
  `packages/core/fireux-core/src/runtime/components/${path}.vue`
const molecules = (path: string) => core(`molecules/${path}`)

export const fireuxDocsCatalogue = [
  molecule({
    category: 'Surfaces',
    componentName: 'MoleculesActionSurface',
    name: 'ActionSurface',
    slug: 'action-surface',
    description:
      'A single surface that is explicitly static, linked, or actionable.',
    responsibility: 'Give card-like content honest interaction semantics.',
    source: molecules('ActionSurface'),
    uses: [
      component(core('Workspace/TargetCard')),
      component(core('public/OperationsGrid')),
    ],
    passed: ['action', 'disabled', 'to'],
    derived: 'whether the root is a link, button, or static element',
    props: 3,
    booleans: 2,
    children: ['ULink'],
  }),
  molecule({
    category: 'Surfaces',
    componentName: 'MoleculesMetricBadge',
    name: 'MetricBadge',
    slug: 'metric-badge',
    description: 'A compact value and label presented as one readable metric.',
    responsibility: 'Present a labelled measurement with optional iconography.',
    source: molecules('MetricBadge'),
    uses: [
      page(
        'projects/fireux/fireux-app/app/pages/design/components/contracts.vue'
      ),
    ],
    passed: [
      'value',
      'label',
      'icon',
      'variant',
      'color',
      'size',
      'title',
      'ariaLabel',
    ],
    derived: 'the accessible label and optional icon visibility',
    props: 8,
    children: ['UBadge', 'UIcon'],
  }),
  molecule({
    category: 'Surfaces',
    componentName: 'MoleculesStateCard',
    name: 'StateCard',
    slug: 'state-card',
    description:
      'A consistent loading, empty, missing, or error state for records and collections.',
    responsibility: 'Present one explicit data outcome.',
    source: molecules('StateCard'),
    uses: [
      component(core('Workspace/EntityCollection')),
      page(
        'packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue'
      ),
    ],
    passed: [
      'entity',
      'kind',
      'state',
      'surface',
      'title',
      'description',
      'icon',
      'loading',
      'layout',
      'uppercase',
    ],
    derived:
      'resolved state, title, description, icon, live-region role, and layout',
    props: 10,
    booleans: 2,
    children: ['UCard', 'UIcon'],
  }),
  molecule({
    category: 'Forms',
    componentName: 'MoleculesCreateShell',
    name: 'CreateShell',
    slug: 'create-shell',
    description:
      'A Write and Preview shell with clear, submit, and loading states.',
    responsibility:
      'Compose a create flow around owner-provided fields and preview.',
    source: molecules('Create/Shell'),
    uses: [
      page('packages/extensions/fireux-jobs/src/runtime/pages/jobs/create.vue'),
      component(
        'packages/extensions/fireux-products/src/runtime/product/components/Create/System.vue'
      ),
    ],
    passed: ['submitLabel', 'loading'],
    derived: 'active Write or Preview tab',
    props: 2,
    booleans: 1,
    children: ['UCard', 'UTabs', 'UButton'],
  }),
  molecule({
    category: 'Forms',
    componentName: 'MoleculesFormsArrayOfStrings',
    name: 'ArrayOfStrings',
    slug: 'array-of-strings',
    description: 'An editable ordered list of short text values.',
    responsibility: 'Edit a string array through one labelled field.',
    source: molecules('forms/ArrayOfStrings'),
    uses: [
      component(
        'packages/extensions/fireux-blogs/src/runtime/components/Blog/Create/Advanced.vue'
      ),
    ],
    passed: ['label', 'modelValue', 'itemPlaceholder', 'newItemPlaceholder'],
    derived: 'editing state, formatted value, and validation message',
    props: 4,
    children: ['UInput', 'UButton'],
  }),
  molecule({
    category: 'Forms',
    componentName: 'MoleculesFormsBrandPalette',
    name: 'BrandPalette',
    slug: 'brand-palette',
    description: 'A focused editor for selected and inherited brand colours.',
    responsibility: 'Edit the cross-industry brand palette contract.',
    source: molecules('forms/BrandPalette'),
    uses: [
      component(
        'packages/extensions/fireux-places/src/runtime/place/components/Onboarding/Brand.vue'
      ),
    ],
    passed: [
      'modelValue',
      'inherited',
      'disabled',
      'activeLabel',
      'inheritLabel',
    ],
    derived: 'effective selected or inherited colour for each palette field',
    props: 5,
    booleans: 1,
    children: ['UFormField', 'UInput'],
  }),
  molecule({
    category: 'Forms',
    componentName: 'MoleculesFormsEditableCheckbox',
    name: 'EditableCheckbox',
    slug: 'editable-checkbox',
    description: 'An inline boolean value with separate read and edit modes.',
    responsibility: 'Read and update one boolean field.',
    source: molecules('forms/editable/Checkbox'),
    uses: [
      component(
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus/Ordering/WhatsApp.vue'
      ),
    ],
    passed: [
      'label',
      'value',
      'update',
      'checkboxLabel',
      'displayLabel',
      'trueLabel',
      'falseLabel',
      'disabled',
      'disabledMessage',
    ],
    derived: 'draft, optimistic value, saving state, and error message',
    props: 9,
    booleans: 2,
    children: ['UCheckbox'],
  }),
  molecule({
    category: 'Forms',
    componentName: 'MoleculesFormsEditableImagePicker',
    name: 'EditableImagePicker',
    slug: 'editable-image-picker',
    description: 'An image preview with a native file-selection action.',
    responsibility: 'Select one image file and hand it to its owning uploader.',
    source: molecules('forms/editable/ImagePicker'),
    uses: [
      component(
        'packages/extensions/fireux-places/src/runtime/place/components/Edit/Summary.vue'
      ),
      component(
        'packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Edit.vue'
      ),
    ],
    passed: [
      'src',
      'alt',
      'initials',
      'avatarClass',
      'icon',
      'size',
      'buttonLabel',
      'loading',
      'disabled',
      'update',
    ],
    derived: 'whether the picker can open and which image fallback renders',
    props: 10,
    booleans: 2,
    children: ['UAvatar', 'UButton'],
  }),
  molecule({
    category: 'Forms',
    componentName: 'MoleculesFormsEditableSelect',
    name: 'EditableSelect',
    slug: 'editable-select',
    description: 'An inline option value with separate read and edit modes.',
    responsibility: 'Read and update one value from a finite option set.',
    source: molecules('forms/editable/Select'),
    uses: [component(core('Dashboard/Overview'))],
    passed: [
      'label',
      'value',
      'options',
      'placeholder',
      'update',
      'disabled',
      'disabledMessage',
    ],
    derived:
      'normalized options, display value, draft, saving state, and error message',
    props: 7,
    booleans: 1,
    children: ['USelect'],
  }),
  molecule({
    category: 'Onboarding',
    componentName: 'MoleculesOnboardingSystem',
    name: 'OnboardingSystem',
    slug: 'onboarding-system',
    description: 'A staged onboarding shell for an owner-provided journey.',
    responsibility: 'Present one onboarding stage and its progress.',
    source: molecules('onboarding/System'),
    uses: [
      component(
        'packages/extensions/fireux-places/src/runtime/place/components/Onboarding.vue'
      ),
      component(
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Onboarding.vue'
      ),
    ],
    passed: ['family', 'stage'],
    derived: 'stage progress, error state, and owner-provided regions',
    props: 2,
    children: ['UCard', 'UProgress', 'UAlert'],
  }),
  molecule({
    category: 'Profiles',
    componentName: 'MoleculesProfilesAdminCreateCard',
    name: 'AdminCreateCard',
    slug: 'admin-create-card',
    description:
      'A bounded administrator action for creating one profile record.',
    responsibility: 'Present profile creation copy, progress, and failure.',
    source: molecules('profiles/AdminCreateCard'),
    uses: [component(core('Dashboard/Admin'))],
    passed: ['title', 'description', 'buttonLabel', 'loading', 'error'],
    derived: 'whether the action is loading and whether an error renders',
    props: 5,
    booleans: 1,
    children: ['UPageCard', 'UButton'],
  }),
  {
    category: 'Page',
    componentName: 'EntityCollectionPage',
    name: 'EntityCollectionPage',
    slug: 'entity-collection-page',
    description: 'The shared shell for an ordinary Entity Collection Page.',
    owner: 'Entity Collection Page',
    responsibility: 'Compose the shared Entity Collection Page shell.',
    scope: 'cross-industry',
    source: core('Entity/Collection/Page'),
    usedBy: [
      page('packages/core/fireux-core/src/runtime/pages/apps/index.vue'),
      page('packages/core/fireux-core/src/runtime/pages/users/index.vue'),
    ],
    objects: {
      fetched: [],
      passed: ['title', 'description', 'eyebrow', 'icon', 'secondaryLabel'],
    },
    derived: ['whether background, actions, hero, and secondary slots render'],
    inputs: {
      propCount: 5,
      booleanCount: 0,
      genericNames: [],
      ownershipGroups: ['Entity Collection Page'],
    },
    nuxtUiChildren: ['UPage', 'UPageBody', 'UIcon'],
  },
] as const satisfies readonly FireuxDocsCatalogueEntry[]

export type FireuxDocsReview = {
  color: 'error' | 'success' | 'warning'
  label: 'Clear' | 'Obtuse' | 'Review'
  reasons: string[]
}

export function reviewFireuxDocsCatalogueEntry(
  entry: FireuxDocsCatalogueEntry
): FireuxDocsReview {
  const reason = `${entry.inputs.propCount} top-level props`
  if (entry.inputs.propCount > 16)
    return { color: 'error', label: 'Obtuse', reasons: [reason] }
  if (entry.inputs.propCount > 10)
    return { color: 'warning', label: 'Review', reasons: [reason] }
  return { color: 'success', label: 'Clear', reasons: [reason] }
}

export function findFireuxDocsCatalogueEntry(slug: string) {
  return fireuxDocsCatalogue.find((entry) => entry.slug === slug) || null
}
