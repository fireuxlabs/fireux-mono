import { computed, reactive, ref } from 'vue'
import { useRoute } from '#imports'
import { fireuxOffer } from '../meta'



export function useIgnitionRequestForm() {
  type IgnitionResponse = {
    ok: true
    reference: string
  }

  const pageOptions = [
    { label: 'Home', value: 'home' },
    { label: 'About', value: 'about' },
    { label: 'Services', value: 'services' },
    { label: 'Products', value: 'products' },
    { label: 'Booking or request', value: 'booking' },
    { label: 'News', value: 'news' },
    { label: 'Contact', value: 'contact' },
    { label: 'Customer account', value: 'account' },
  ] as const

  type PageOption = (typeof pageOptions)[number]['value']
  type IgnitionOrigin = {
    surface: 'pricing' | 'solution' | 'app-directory'
    ref: string
  }

  const brandingOptions = [
    { label: 'Logo and colours ready', value: 'ready' },
    { label: 'Use my current website', value: 'use-existing' },
    { label: 'I need help with branding', value: 'help' },
  ]

  const confirmationSteps = fireuxOffer.ignition.confirmationSteps

  const initialForm = () => ({
    contact_name: '',
    contact_email: '',
    business_name: '',
    website: '',
    branding: 'ready',
    pages: ['home', 'services', 'contact'] as PageOption[],
    app_job: '',
    access: '',
    privacy_acknowledged: false,
    fax_number: '',
  })

  const form = reactive(initialForm())
  const route = useRoute()
  const errors = reactive<Record<string, string>>({})
  const submitting = ref(false)
  const requestError = ref('')
  const submittedReference = ref('')

  function queryValue(value: unknown) {
    const candidate = Array.isArray(value) ? value[0] : value
    return String(candidate ?? '').trim().toLowerCase()
  }

  function safeOriginRef(value: unknown) {
    const candidate = queryValue(value)
    return /^[a-z0-9](?:[a-z0-9-]{0,94}[a-z0-9])?$/.test(candidate)
      ? candidate
      : ''
  }

  const origin = computed<IgnitionOrigin | null>(() => {
    if (queryValue(route.query.from) === 'pricing-apps') {
      return { surface: 'pricing', ref: 'apps' }
    }

    const solution = safeOriginRef(route.query.solution)
    if (solution) return { surface: 'solution', ref: solution }

    const example = safeOriginRef(route.query.example)
    if (example) return { surface: 'app-directory', ref: example }

    return null
  })

  const originLabel = computed(() => {
    if (origin.value?.surface === 'pricing') return 'From app pricing'
    if (origin.value?.surface === 'solution') return 'From a FireUX solution'
    if (origin.value?.surface === 'app-directory') return 'From an app example'
    return ''
  })

  function normalizeWebsite() {
    const website = form.website.trim()
    if (website && !/^https?:\/\//i.test(website)) {
      form.website = `https://${website}`
    }
  }

  function togglePage(page: PageOption, checked: boolean) {
    const next = new Set(form.pages)
    if (checked) next.add(page)
    else next.delete(page)
    form.pages = Array.from(next)
  }

  function validate() {
    for (const key of Object.keys(errors)) delete errors[key]
    if (form.contact_name.trim().length < 2)
      errors.contact_name = 'Add your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())) {
      errors.contact_email = 'Add a valid email.'
    }
    if (form.business_name.trim().length < 2) {
      errors.business_name = 'Add the business name.'
    }
    if (form.website.trim()) {
      normalizeWebsite()
      try {
        const website = new URL(form.website)
        if (!['http:', 'https:'].includes(website.protocol)) throw new Error()
      } catch {
        errors.website = 'Add a valid website address.'
      }
    }
    if (!form.branding) errors.branding = 'Choose a branding option.'
    if (!form.pages.length) errors.pages = 'Choose at least one page.'
    if (form.app_job.trim().length < 10) {
      errors.app_job = 'Describe what the App needs to do in a little more detail.'
    }
    if (form.access.trim().length < 3) errors.access = 'Tell us who needs access.'
    if (!form.privacy_acknowledged) {
      errors.privacy_acknowledged = 'Confirm that FireUX may reply.'
    }
    return Object.keys(errors).length === 0
  }

  function responseMessage(error: unknown) {
    const source = error as {
      data?: { statusMessage?: string; message?: string }
      statusMessage?: string
      message?: string
    }
    return (
      source.data?.statusMessage ||
      source.data?.message ||
      source.statusMessage ||
      source.message ||
      'Please try again or email fire@fireux.app.'
    )
  }

  async function submitRequest() {
    requestError.value = ''
    if (!validate() || submitting.value) return

    submitting.value = true
    try {
      const response = await $fetch<IgnitionResponse>('/api/public/ignition', {
        method: 'POST',
        body: {
          ...form,
          ...(origin.value ? { origin: origin.value } : {}),
        },
      })
      submittedReference.value = response.reference
    } catch (error) {
      requestError.value = responseMessage(error)
    } finally {
      submitting.value = false
    }
  }

  function resetForm() {
    Object.assign(form, initialForm())
    for (const key of Object.keys(errors)) delete errors[key]
    requestError.value = ''
    submittedReference.value = ''
  }

  return {
    brandingOptions,
    confirmationSteps,
    errors,
    form,
    normalizeWebsite,
    origin,
    originLabel,
    pageOptions,
    requestError,
    resetForm,
    submitRequest,
    submittedReference,
    submitting,
    togglePage,
  }
}
