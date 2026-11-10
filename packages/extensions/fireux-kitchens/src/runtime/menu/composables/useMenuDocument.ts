import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useKitchenCollection } from '../../kitchen/composables/useKitchenCollection'
import { useKitchenCreate } from '../../kitchen/composables/useKitchenCreate'
import {
  readGuestKitchenClaim,
  rememberGuestKitchenClaim,
  restoreGuestKitchenClaim,
  type GuestKitchenClaim,
} from '../../kitchen/utils/guest-kitchen-claim'
import { useMenuEditorScope } from './useMenuEditorScope'
import { useMenuFilePreview } from './useMenuFilePreview'
import type { MenuDocumentRead } from '../models/menu-detail.model'

/** Select a Kitchen, preview one file, then publish or replace its document Menu. */
export function useMenuDocument() {
  const auth = useAuth()
  const config = useFireUXConfig()
  const route = useRoute()
  const kitchens = useKitchenCollection({
    enabled: () => auth.isAuthenticated.value,
  })
  const creation = useKitchenCreate()
  const claim = ref<GuestKitchenClaim | null>(null)
  const mounted = ref(false)
  const recoveryVersion = ref(0)
  const createdKitchenId = ref('')
  const kitchenChoice = ref('')
  const menuChoice = ref('')
  const venue = ref('')
  const file = ref<File | null>(null)
  const data = ref<MenuDocumentRead | null>(null)
  const busy = ref(false)
  const loading = ref(false)
  const message = ref('')
  const commandError = ref('')
  const recoveryError = ref('')
  const localPreview = ref('')

  const kitchenId = computed(
    () =>
      kitchenChoice.value ||
      createdKitchenId.value ||
      claim.value?.kitchenId ||
      (kitchens.kitchens.value.length === 1
        ? kitchens.kitchens.value[0]!.id || ''
        : '')
  )
  const secret = computed(() =>
    claim.value?.kitchenId === kitchenId.value ? claim.value.secret : ''
  )
  const kitchenOptions = computed(() => {
    const options = kitchens.kitchens.value.map((kitchen) => ({
      value: kitchen.id || '',
      label: kitchen.name || 'Kitchen',
    }))
    if (
      claim.value &&
      !options.some((item) => item.value === claim.value!.kitchenId)
    )
      options.unshift({ value: claim.value.kitchenId, label: 'Your Menu' })
    return options
  })
  const capture = useMenuEditorScope(
    [kitchenChoice, recoveryVersion, menuChoice, file, venue],
    () => {
      busy.value = loading.value = false
      commandError.value = message.value = ''
    }
  )
  const error = computed(() => commandError.value || recoveryError.value)
  const canPublish = computed(() =>
    Boolean(
      file.value &&
        mounted.value &&
        auth.currentUser.value &&
        !recoveryError.value &&
        !busy.value &&
        !loading.value &&
        data.value?.acceptsDocument !== false &&
        (kitchenId.value || venue.value.trim()) &&
        !(auth.isAuthenticated.value && !secret.value && kitchens.pending.value)
    )
  )
  const recoveryLink = computed(() =>
    import.meta.client && secret.value
      ? `${new URL(route.path, location.origin)}#${new URLSearchParams({ kitchen: kitchenId.value, key: secret.value })}`
      : ''
  )
  const publicUrl = computed(() =>
    import.meta.client && data.value?.status === 'published'
      ? new URL(data.value.menuPath, location.origin).toString()
      : ''
  )
  const savedPreview = useMenuFilePreview({
    enabled: () =>
      Boolean(
        mounted.value &&
          auth.currentUser.value &&
          data.value?.document &&
          !file.value &&
          !loading.value &&
          !recoveryError.value
      ),
    sources: [
      kitchenId,
      () => data.value?.menuId,
      () => data.value?.revision,
      secret,
      recoveryVersion,
    ],
    async read({ signal, isCurrent }) {
      const body = {
        kitchenId: kitchenId.value,
        menuId: data.value!.menuId,
        expectedRevision: data.value!.revision,
        claimSecret: secret.value || undefined,
      }
      const token = await getToken(isCurrent)
      return $fetch<Blob>('/api/kitchens/menus/document/file', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
        responseType: 'blob',
        signal,
      })
    },
  })
  const preview = computed(() =>
    file.value && localPreview.value
      ? {
          name: file.value.name,
          file: {
            url: localPreview.value,
            name: file.value.name,
            type: file.value.type,
          },
        }
      : data.value?.document && savedPreview.url.value
        ? {
            name: data.value.name,
            file: { ...data.value.document, url: savedPreview.url.value },
          }
        : null
  )

  function releasePreview() {
    if (localPreview.value) URL.revokeObjectURL(localPreview.value)
    localPreview.value = ''
  }
  watch(file, (value) => {
    releasePreview()
    if (value) localPreview.value = URL.createObjectURL(value)
  })
  onScopeDispose(releasePreview)

  async function restore() {
    recoveryVersion.value++
    recoveryError.value = ''
    const params = new URLSearchParams(route.hash.slice(1))
    try {
      if (params.has('key') || params.has('kitchen')) {
        restoreGuestKitchenClaim(config.appId, {
          kitchenId: params.get('kitchen') || '',
          secret: params.get('key') || '',
        })
        kitchenChoice.value = ''
        createdKitchenId.value = ''
      }
    } catch (cause) {
      recoveryError.value =
        cause instanceof Error ? cause.message : 'The recovery link is invalid.'
    }
    claim.value = readGuestKitchenClaim(config.appId)
    mounted.value = true
    if (route.hash)
      await navigateTo(
        { path: route.path, query: route.query, hash: '' },
        { replace: true }
      )
  }
  onMounted(restore)
  watch(
    () => route.hash,
    (hash) => {
      if (mounted.value && hash) void restore()
    }
  )
  watch(
    () => auth.currentUser.value?.uid,
    (uid, previous) => {
      if (previous && uid !== previous) {
        kitchenChoice.value = ''
        createdKitchenId.value = ''
        menuChoice.value = ''
        venue.value = ''
        file.value = null
      }
    }
  )
  watch(
    [kitchenId, recoveryVersion],
    () => {
      menuChoice.value = ''
    },
    { flush: 'sync' }
  )
  watch(
    [
      mounted,
      kitchenId,
      secret,
      recoveryVersion,
      () => auth.currentUser.value?.uid,
      menuChoice,
    ],
    () => {
      data.value = null
      if (!busy.value) void reload()
    }
  )

  function assertCurrent(current: () => boolean) {
    if (!current()) throw new Error('The Menu or account changed. Try again.')
  }
  async function getToken(current: () => boolean) {
    const user = auth.currentUser.value
    if (!user)
      throw new Error('The browser is still connecting. Please try again.')
    const token = await user.getIdToken()
    assertCurrent(current)
    return token
  }
  async function resolveKitchen(
    venueName: string,
    token: string,
    current: () => boolean
  ) {
    const user = auth.currentUser.value!
    let id = kitchenId.value
    if (user.isAnonymous && (!id || id === user.uid)) {
      const proof = await rememberGuestKitchenClaim(config.appId, user.uid)
      assertCurrent(current)
      claim.value = proof
      const result = await $fetch<{ kitchen_id: string }>(
        '/api/kitchens/onboarding/guest',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: { claim_secret: claim.value.secret, name: venueName },
        }
      )
      if (result.kitchen_id !== user.uid)
        throw new Error('The response did not identify your Kitchen.')
      id = result.kitchen_id
    } else if (!id) {
      id = (
        await creation.createKitchenShell({
          intent: 'create_shell',
          name: venueName,
        })
      ).kitchen_id
      if (!id) throw new Error('The response did not identify your Kitchen.')
    }
    assertCurrent(current)
    createdKitchenId.value = id
    return {
      kitchenId: id,
      claimSecret:
        claim.value?.kitchenId === id ? claim.value.secret : undefined,
    }
  }
  function read(token: string, id: string, claimSecret?: string) {
    return $fetch<MenuDocumentRead>('/api/kitchens/menus/document/read', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        kitchenId: id,
        menuId: menuChoice.value || undefined,
        claimSecret,
      },
    })
  }
  function fail(cause: unknown, fallback: string) {
    const failure = cause as {
      data?: { statusMessage?: string }
      message?: string
    }
    commandError.value =
      failure?.data?.statusMessage || failure?.message || fallback
  }
  async function reload() {
    if (
      !mounted.value ||
      !kitchenId.value ||
      !auth.currentUser.value ||
      busy.value ||
      loading.value
    )
      return
    const current = capture()
    const id = kitchenId.value
    const proof = secret.value || undefined
    loading.value = true
    commandError.value = ''
    try {
      const token = await getToken(current)
      const result = await read(token, id, proof)
      if (current() && kitchenId.value === id) data.value = result
    } catch (cause) {
      if (current() && kitchenId.value === id) {
        data.value = null
        const status = cause as { statusCode?: number; status?: number }
        if (status?.statusCode !== 404 && status?.status !== 404)
          fail(cause, 'Could not open your Menu.')
      }
    } finally {
      if (current()) loading.value = false
    }
  }
  async function publish() {
    if (!canPublish.value || !file.value) return
    const current = capture()
    const selectedFile = file.value
    const name = venue.value.trim() || data.value?.venue || ''
    if (!name) {
      commandError.value = 'Add your venue name.'
      return
    }
    busy.value = true
    commandError.value = message.value = ''
    try {
      const token = await getToken(current)
      const destination = await resolveKitchen(name, token, current)
      const existing = await read(
        token,
        destination.kitchenId,
        destination.claimSecret
      )
      assertCurrent(current)
      if (data.value && data.value.revision !== existing.revision)
        throw new Error('The Menu changed. Reload before replacing it.')
      const body = new FormData()
      body.set('kitchenId', destination.kitchenId)
      body.set('menuId', existing.menuId)
      body.set('revision', existing.revision)
      body.set('venueName', name)
      if (destination.claimSecret)
        body.set('claimSecret', destination.claimSecret)
      body.append('file', selectedFile, selectedFile.name)
      const result = await $fetch<MenuDocumentRead>(
        '/api/kitchens/menus/document',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body,
        }
      )
      if (!current()) return
      if (
        result.kitchenId !== destination.kitchenId ||
        result.menuId !== existing.menuId ||
        result.status !== 'published'
      )
        throw new Error('The response did not identify your published Menu.')
      data.value = result
      file.value = null
      message.value = existing.document
        ? 'Document replaced. Your link and QR are unchanged.'
        : 'Your Menu is online.'
    } catch (cause) {
      if (current()) fail(cause, 'The Menu was not published. Try again.')
    } finally {
      if (current()) busy.value = false
    }
  }
  return {
    kitchenId,
    kitchenChoice,
    kitchenOptions,
    menuChoice,
    venue,
    file,
    data,
    busy,
    loading,
    error,
    message,
    preview,
    previewPending: savedPreview.pending,
    previewError: savedPreview.error,
    retryPreview: savedPreview.retry,
    canPublish,
    recoveryLink,
    publicUrl,
    publish,
    reload,
  }
}
