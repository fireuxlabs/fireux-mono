<!-- FILE: packages/core/fireux-core/src/runtime/pages/dev/forms.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Dev · Forms"
      description="Sandbox for Firestore and local form components."
    />

    <UPageBody class="pagebody">
      <UCard class="space-y-2">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h1 class="text-base font-semibold">Forms Sandbox</h1>
          </div>
        </template>
        <p class="text-sm text-muted">
          Safe playground backed by Firestore collection <span class="font-mono">test</span>.
          Each form writes to a dedicated doc id (e.g. <span class="font-mono">singlefield</span>).
        </p>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">ImagePicker</h2>
            <span class="font-mono text-xs text-muted">test/avatarpicker</span>
          </div>
        </template>

        <MoleculesFormsFirestoreImagePicker
          :src="avatarPreview"
          alt="Avatar"
          initials="FX"
          :update-function="updateAvatar"
        />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ avatarDoc }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">SimpleField</h2>
            <span class="font-mono text-xs text-muted">test/singlefield</span>
          </div>
        </template>

        <MoleculesFormsFirestoreSimpleField
          label="Value"
          :firebase-value="singleDoc?.value ?? ''"
          placeholder="type here"
          :update-function="updateSingle"
        />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ singleDoc }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">Field</h2>
            <span class="font-mono text-xs text-muted">test/field</span>
          </div>
        </template>

        <div class="space-y-4">
          <MoleculesFormsFirestoreField
            label="Text"
            :firebase-value="fieldDoc?.text ?? ''"
            placeholder="type here"
            type="text"
            :update-function="updateFieldText"
          />

          <MoleculesFormsFirestoreField
            label="Textarea"
            :firebase-value="fieldDoc?.textarea ?? ''"
            placeholder="multiline"
            type="textarea"
            :rows="4"
            :update-function="updateFieldTextarea"
          />

          <MoleculesFormsFirestoreField
            label="Phone"
            :firebase-value="fieldDoc?.phone ?? ''"
            placeholder="(555) 555-5555"
            type="phone"
            :update-function="updateFieldPhone"
          />

          <MoleculesFormsFirestoreField
            label="Email"
            :firebase-value="fieldDoc?.email ?? ''"
            placeholder="name@example.com"
            type="email"
            :update-function="updateFieldEmail"
          />
        </div>

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ fieldDoc }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">Checkbox</h2>
            <span class="font-mono text-xs text-muted">test/checkbox</span>
          </div>
        </template>

        <MoleculesFormsFirestoreCheckbox
          label="Enabled"
          checkbox-label="Enabled"
          :firebase-value="checkboxDoc?.value ?? false"
          :update-function="updateCheckbox"
        />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ checkboxDoc }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">Select</h2>
            <span class="font-mono text-xs text-muted">test/select</span>
          </div>
        </template>

        <MoleculesFormsFirestoreSelect
          label="Choice"
          :options="selectOptions"
          :firebase-value="selectDoc?.value ?? ''"
          placeholder="Pick one"
          :update-function="updateSelect"
        />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ selectDoc }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">ArrayOfStrings (Firestore)</h2>
            <span class="font-mono text-xs text-muted">test/arrayofstrings</span>
          </div>
        </template>

        <MoleculesFormsFirestoreArrayOfStrings
          label="Items"
          :firebase-value="arrayOfStringsDoc?.items ?? []"
          item-placeholder="Item"
          new-item-placeholder="Add new item"
          :update-function="updateArrayOfStrings"
        />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ arrayOfStringsDoc }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">MultiField</h2>
            <span class="font-mono text-xs text-muted">test/multifield</span>
          </div>
        </template>

        <MoleculesFormsFirestoreMultiField
          label="Profile"
          :firebase-value="multiFieldDoc?.value ?? {}"
          placeholder="Not set"
          :placeholders="multiFieldPlaceholders"
          :update-function="updateMultiField"
          :commas="true"
        />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ multiFieldDoc }}</pre>
      </UCard>

      <div class="space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold">ObjectArray</h2>
          <span class="font-mono text-xs text-muted">test/objectarray</span>
        </div>

        <MoleculesFormsFirestoreObjectArray
          label="Links"
          :firebase-value="objectArrayDoc?.items ?? []"
          :update-function="updateObjectArray"
        >
          <template #display="slotProps">
            <div class="p-4 border border-dashed rounded">
              <div class="text-sm font-medium">{{ slotProps.item?.name || 'Untitled' }}</div>
              <div class="text-xs text-muted">{{ slotProps.item?.url || 'No URL' }}</div>
              <div class="mt-3 flex gap-2">
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-lucide-pencil"
                  @click="slotProps.startEditing()"
                >
                  Edit
                </UButton>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  @click="slotProps.remove()"
                >
                  Remove
                </UButton>
              </div>
            </div>
          </template>

          <template #edit="slotProps">
            <div class="rounded border border-dashed border-primary/30 bg-primary/10 p-4">
              <div class="grid gap-2">
                <UInput v-model="slotProps.item.name" placeholder="Name" />
                <UInput v-model="slotProps.item.url" placeholder="https://..." />
              </div>
              <div class="mt-3 flex gap-2">
                <UButton size="xs" variant="solid" icon="i-lucide-check" @click="slotProps.save()">
                  Save
                </UButton>
                <UButton size="xs" variant="soft" icon="i-lucide-x" @click="slotProps.cancel()">
                  Cancel
                </UButton>
              </div>
            </div>
          </template>

          <template #create="slotProps">
            <UButton
              type="button"
              size="sm"
              variant="soft"
              icon="i-lucide-plus"
              @click="slotProps.push({ name: '', url: '' })"
            >
              Add item
            </UButton>
          </template>
        </MoleculesFormsFirestoreObjectArray>

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ objectArrayDoc }}</pre>
      </div>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">SocialLinks</h2>
            <span class="font-mono text-xs text-muted">test/sociallinks</span>
          </div>
        </template>

        <MoleculesFormsFirestoreSocialLinks
          :firebase-value="socialLinksDoc?.links ?? {}"
          :update-function="updateSocialLinks"
        />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ socialLinksDoc }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">ListActions</h2>
            <span class="font-mono text-xs text-muted">test/listactions</span>
          </div>
        </template>

        <MoleculesFormsFirestoreListActions
          :items="listActionsDoc?.items ?? []"
          :action-approve="approveListItem"
          :action-reject="rejectListItem"
          approve-label="Approve"
          reject-label="Reject"
          empty-text="Nothing to review."
        />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ listActionsDoc }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">ArrayOfStrings (State)</h2>
            <span class="font-mono text-xs text-muted">local state</span>
          </div>
        </template>

        <MoleculesFormsArrayOfStrings
          label="Tags"
          v-model="stateArrayOfStrings"
          item-placeholder="Tag"
          new-item-placeholder="Add tag"
        />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ stateArrayOfStrings }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">RichText (State)</h2>
            <span class="font-mono text-xs text-muted">local state</span>
          </div>
        </template>

        <MoleculesFormsStateRichText v-model="stateRichText" />

        <pre class="overflow-x-auto rounded-lg border border-default bg-muted p-3 text-xs">{{ stateRichText }}</pre>
      </UCard>

      <UCard class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">ImagePicker (State)</h2>
            <span class="font-mono text-xs text-muted">localStorage</span>
          </div>
        </template>

        <MoleculesFormsStateImagePicker label="Image" state-key="dev-forms-image" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { computed, ref, watchEffect } from 'vue'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreCreate } from '../../composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'

definePageMeta({
  layout: 'dev',
  title: 'Dev · Forms',
  description: 'Sandbox for Firestore and local form components.',
  nav: {
    key: 'dev-forms',
    label: 'Forms',
    icon: 'i-lucide-square-pen',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 40,
  },
})

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
  last_file:
    | {
        name: string
        size: number
        type: string
        lastModified: number
      }
    | null
}

const { setDocument } = useFirestoreCreate()
const { firestoreFetchDoc } = useFirestoreRead()

const db = useFirestore()

const singleRef = firestoreFetchDoc<SingleDoc>('test', 'singlefield')
const checkboxRef = firestoreFetchDoc<CheckboxDoc>('test', 'checkbox')
const selectRef = firestoreFetchDoc<SelectDoc>('test', 'select')
const fieldRef = firestoreFetchDoc<FieldDoc>('test', 'field')
const arrayOfStringsRef = firestoreFetchDoc<ArrayOfStringsDoc>('test', 'arrayofstrings')
const multiFieldRef = firestoreFetchDoc<MultiFieldDoc>('test', 'multifield')
const objectArrayRef = firestoreFetchDoc<ObjectArrayDoc>('test', 'objectarray')
const socialLinksRef = firestoreFetchDoc<SocialLinksDoc>('test', 'sociallinks')
const listActionsRef = firestoreFetchDoc<ListActionsDoc>('test', 'listactions')
const avatarRef = firestoreFetchDoc<AvatarDoc>('test', 'avatarpicker')

const singleDoc = computed(() => singleRef.value)
const checkboxDoc = computed(() => checkboxRef.value)
const selectDoc = computed(() => selectRef.value)
const fieldDoc = computed(() => fieldRef.value)
const arrayOfStringsDoc = computed(() => arrayOfStringsRef.value)
const multiFieldDoc = computed(() => multiFieldRef.value)
const objectArrayDoc = computed(() => objectArrayRef.value)
const socialLinksDoc = computed(() => socialLinksRef.value)
const listActionsDoc = computed(() => listActionsRef.value)
const avatarDoc = computed(() => avatarRef.value)

const avatarPreview = ref('')

const ensured = new Set<string>()

const ensure = async <T extends Record<string, unknown>>(id: string, initial: T) => {
  if (ensured.has(id)) return
  ensured.add(id)
  const ref = doc(db, 'test', id)
  const snap = await getDoc(ref)
  if (snap.exists()) return
  await setDocument('test', id, initial, { stamp: false })
}

const patch = async <T extends Record<string, unknown>>(
  id: string,
  current: T | undefined,
  next: Partial<T>
) => {
  await setDocument('test', id, { ...(current ?? {}), ...(next as any) }, { stamp: false })
}

watchEffect(() => {
  void ensure('avatarpicker', { src: '', last_file: null })
  void ensure('singlefield', { value: '' })
  void ensure('field', { text: '', textarea: '', phone: '', email: '' })
  void ensure('checkbox', { value: false })
  void ensure('select', { value: '' })
  void ensure('arrayofstrings', { items: [] })
  void ensure('multifield', { value: { first: '', last: '', city: '' } })
  void ensure('objectarray', { items: [{ name: 'FireUX', url: 'https://example.com' }] })
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

const selectOptions = [
  { label: 'alpha', value: 'alpha' },
  { label: 'beta', value: 'beta' },
  { label: 'gamma', value: 'gamma' },
]
const updateSelect = async (value: string) =>
  setDocument('test', 'select', { value }, { stamp: false })

const updateArrayOfStrings = async (items: string[]) =>
  setDocument('test', 'arrayofstrings', { items }, { stamp: false })

const multiFieldPlaceholders: Record<string, string> = {
  first: 'First name',
  last: 'Last name',
  city: 'City',
}
const updateMultiField = async (value: Record<string, string>) =>
  setDocument('test', 'multifield', { value }, { stamp: false })

const updateObjectArray = async (items: ObjectArrayItem[]) =>
  setDocument('test', 'objectarray', { items }, { stamp: false })

const updateSocialLinks = async (links: Record<string, string>) =>
  setDocument('test', 'sociallinks', { links }, { stamp: false })

const approveListItem = async (id: string) => {
  const items = listActionsRef.value?.items ?? []
  await setDocument(
    'test',
    'listactions',
    { items: items.filter((x) => x.id !== id) },
    { stamp: false }
  )
}
const rejectListItem = async (id: string) => {
  const items = listActionsRef.value?.items ?? []
  await setDocument(
    'test',
    'listactions',
    { items: items.filter((x) => x.id !== id) },
    { stamp: false }
  )
}

const updateAvatar = async (file: File) => {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Failed to read file'))
    }
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

const stateArrayOfStrings = ref<string[]>(['alpha', 'beta'])
const stateRichText = ref<string>('Hello world')
</script>
