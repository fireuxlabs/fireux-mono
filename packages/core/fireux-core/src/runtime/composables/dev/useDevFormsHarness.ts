import { computed, ref, watchEffect } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from '../fireux/firestore/vuefire'
import { useFirestoreCreate } from '../fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreRead } from '../fireux/firestore/operations/useFirestoreRead'

type SingleDoc = { value: string }
type CheckboxDoc = { value: boolean }
type SelectDoc = { value: string }
type FieldDoc = { text: string; textarea: string; phone: string; email: string }
type ArrayOfStringsDoc = { items: string[] }
type MultiFieldDoc = { value: Record<string, string> }
type ObjectArrayItem = { name: string; url: string }
type ObjectArrayDoc = { items: ObjectArrayItem[] }
type SocialLinksDoc = { links: Record<string, string> }
type ListActionsItem = {
  id: string
  title: string
  subtitle?: string | null
  avatar?: string | null
  initials?: string | null
  to?: string | null
}
type ListActionsDoc = { items: ListActionsItem[] }
type AvatarDoc = {
  src: string
  last_file: {
    name: string
    size: number
    type: string
    lastModified: number
  } | null
}

export function useDevFormsHarness() {
  const { setDocument } = useFirestoreCreate()
  const { firestoreFetchDoc } = useFirestoreRead()
  const db = useFirestore()

  const singleRef = firestoreFetchDoc<SingleDoc>('test', 'singlefield')
  const checkboxRef = firestoreFetchDoc<CheckboxDoc>('test', 'checkbox')
  const selectRef = firestoreFetchDoc<SelectDoc>('test', 'select')
  const fieldRef = firestoreFetchDoc<FieldDoc>('test', 'field')
  const arrayOfStringsRef =
    firestoreFetchDoc<ArrayOfStringsDoc>('test', 'arrayofstrings')
  const multiFieldRef = firestoreFetchDoc<MultiFieldDoc>('test', 'multifield')
  const objectArrayRef = firestoreFetchDoc<ObjectArrayDoc>('test', 'objectarray')
  const socialLinksRef = firestoreFetchDoc<SocialLinksDoc>('test', 'sociallinks')
  const listActionsRef = firestoreFetchDoc<ListActionsDoc>('test', 'listactions')
  const avatarRef = firestoreFetchDoc<AvatarDoc>('test', 'avatarpicker')

  const avatarPreview = ref('')
  const ensured = new Set<string>()
  const ensure = async <T extends Record<string, unknown>>(id: string, initial: T) => {
    if (ensured.has(id)) return
    ensured.add(id)
    const snapshot = await getDoc(doc(db, 'test', id))
    if (!snapshot.exists()) {
      await setDocument('test', id, initial, { stamp: false })
    }
  }
  const patch = async <T extends Record<string, unknown>>(
    id: string,
    current: T | undefined,
    next: Partial<T>
  ) => {
    await setDocument(
      'test', id, { ...(current ?? {}), ...(next as any) }, { stamp: false }
    )
  }

  watchEffect(() => {
    void ensure('avatarpicker', { src: '', last_file: null })
    void ensure('singlefield', { value: '' })
    void ensure('field', { text: '', textarea: '', phone: '', email: '' })
    void ensure('checkbox', { value: false })
    void ensure('select', { value: '' })
    void ensure('arrayofstrings', { items: [] })
    void ensure('multifield', { value: { first: '', last: '', city: '' } })
    void ensure('objectarray', {
      items: [{ name: 'FireUX', url: 'https://example.com' }],
    })
    void ensure('sociallinks', { links: { website: '' } })
    void ensure('listactions', {
      items: [
        { id: 'a', title: 'Alice Example', subtitle: 'Pending', initials: 'AE', to: null },
        { id: 'b', title: 'Bob Example', subtitle: 'Pending', initials: 'BE', to: null },
      ],
    })
  })

  const updateSingle = async (value: string) =>
    setDocument('test', 'singlefield', { value }, { stamp: false })
  const updateFieldText = async (value: string) =>
    patch<FieldDoc>('field', fieldRef.value, { text: value })
  const updateFieldTextarea = async (value: string) =>
    patch<FieldDoc>('field', fieldRef.value, { textarea: value })
  const updateFieldPhone = async (value: string) =>
    patch<FieldDoc>('field', fieldRef.value, { phone: value })
  const updateFieldEmail = async (value: string) =>
    patch<FieldDoc>('field', fieldRef.value, { email: value })
  const updateCheckbox = async (value: boolean | null) =>
    setDocument('test', 'checkbox', { value: Boolean(value) }, { stamp: false })
  const updateSelect = async (value: string) =>
    setDocument('test', 'select', { value }, { stamp: false })
  const updateArrayOfStrings = async (items: string[]) =>
    setDocument('test', 'arrayofstrings', { items }, { stamp: false })
  const updateMultiField = async (value: Record<string, string>) =>
    setDocument('test', 'multifield', { value }, { stamp: false })
  const updateObjectArray = async (items: ObjectArrayItem[]) =>
    setDocument('test', 'objectarray', { items }, { stamp: false })
  const updateSocialLinks = async (links: Record<string, string>) =>
    setDocument('test', 'sociallinks', { links }, { stamp: false })
  const removeListItem = async (id: string) => {
    const items = listActionsRef.value?.items ?? []
    await setDocument(
      'test', 'listactions', { items: items.filter((item) => item.id !== id) },
      { stamp: false }
    )
  }
  const updateAvatar = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () =>
        typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Failed to read file'))
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
    avatarPreview.value = dataUrl
    await setDocument(
      'test',
      'avatarpicker',
      {
        src: avatarRef.value?.src ?? '',
        last_file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        },
      },
      { stamp: false }
    )
  }
  watchEffect(() => {
    if (!avatarPreview.value && avatarRef.value?.src) {
      avatarPreview.value = avatarRef.value.src
    }
  })

  return {
    singleDoc: computed(() => singleRef.value),
    checkboxDoc: computed(() => checkboxRef.value),
    selectDoc: computed(() => selectRef.value),
    fieldDoc: computed(() => fieldRef.value),
    arrayOfStringsDoc: computed(() => arrayOfStringsRef.value),
    multiFieldDoc: computed(() => multiFieldRef.value),
    objectArrayDoc: computed(() => objectArrayRef.value),
    socialLinksDoc: computed(() => socialLinksRef.value),
    listActionsDoc: computed(() => listActionsRef.value),
    avatarDoc: computed(() => avatarRef.value),
    avatarPreview,
    selectOptions: [
      { label: 'alpha', value: 'alpha' },
      { label: 'beta', value: 'beta' },
      { label: 'gamma', value: 'gamma' },
    ],
    multiFieldPlaceholders: {
      first: 'First name', last: 'Last name', city: 'City',
    } as Record<string, string>,
    updateSingle,
    updateFieldText,
    updateFieldTextarea,
    updateFieldPhone,
    updateFieldEmail,
    updateCheckbox,
    updateSelect,
    updateArrayOfStrings,
    updateMultiField,
    updateObjectArray,
    updateSocialLinks,
    approveListItem: removeListItem,
    rejectListItem: removeListItem,
    updateAvatar,
    stateArrayOfStrings: ref<string[]>(['alpha', 'beta']),
    stateRichText: ref('Hello world'),
  }
}
