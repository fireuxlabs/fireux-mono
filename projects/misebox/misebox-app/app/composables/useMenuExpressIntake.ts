import { reactive, ref, onMounted } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

/** Owns intake draft, recovery identity and submission lifecycle. */
export function useMenuExpressIntake() {
  const localDevelopment = import.meta.dev
  const { currentUser } = useAuth()
  const form = reactive({
    name: '',
    email: '',
    venue: '',
    location: '',
    sourceUrl: '',
    instructions: '',
    demo: false,
  })
  const captureIntent = useCommandScope([
    () => currentUser.value,
    () => JSON.stringify(form),
  ])
  const busy = ref(false),
    error = ref('')
  const pendingInput = ref<typeof form | null>(null)
  const draftKey = 'misebox:menu-express:intake'
  function restoreSubmission() {
    if (!pendingInput.value || busy.value) return
    Object.assign(form, pendingInput.value)
    error.value = ''
  }
  onMounted(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || 'null')
      if (saved?.input) {
        pendingInput.value = saved.input
        restoreSubmission()
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  })
  async function submit() {
    if (busy.value) return
    busy.value = true
    error.value = ''
    const isCurrent = captureIntent()
    const snapshot = { ...form },
      user = currentUser.value
    try {
      let saved: { id: string; token: string; input: typeof snapshot } | null =
        JSON.parse(localStorage.getItem(draftKey) || 'null')
      if (!saved) {
        saved = {
          id: crypto.randomUUID(),
          token: [...crypto.getRandomValues(new Uint8Array(32))]
            .map((n) => n.toString(16).padStart(2, '0'))
            .join(''),
          input: snapshot,
        }
        localStorage.setItem(draftKey, JSON.stringify(saved))
      }
      pendingInput.value = saved.input
      if (JSON.stringify(saved.input) !== JSON.stringify(snapshot))
        throw new Error(
          'Use “Restore submitted details”, then submit again to recover your previous request.'
        )
      const headers =
        user && !user.isAnonymous
          ? { authorization: `Bearer ${await user.getIdToken()}` }
          : undefined
      if (!isCurrent())
        throw new Error('Account changed. Retry with the current account.')
      await $fetch('/api/menu-express', {
        method: 'POST',
        headers,
        body: { ...saved.input, id: saved.id, token: saved.token },
      })
      if (!isCurrent())
        throw new Error(
          'Request saved, but your account changed. Restore the original context to continue.'
        )
      localStorage.setItem(
        `misebox:menu-express:${saved.id}`,
        JSON.stringify({
          token: saved.token,
          expiresAt: Date.now() + 30 * 86400_000,
        })
      )
      localStorage.removeItem(draftKey)
      pendingInput.value = null
      await navigateTo(`/menu-express/${saved.id}`)
    } catch (cause: any) {
      if (isCurrent()) {
        if (cause?.statusCode === 400 || cause?.status === 400) {
          localStorage.removeItem(draftKey)
          pendingInput.value = null
        }
        error.value = cause?.data?.statusMessage || cause.message
      }
    } finally {
      busy.value = false
    }
  }
  return {
    localDevelopment,
    form,
    busy,
    error,
    pendingInput,
    restoreSubmission,
    submit,
  }
}
