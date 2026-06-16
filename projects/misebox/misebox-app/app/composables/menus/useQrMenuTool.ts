import { computed } from 'vue'

export function useQrMenuTool() {
  const consumerBaseUrl = import.meta.dev
    ? 'http://localhost:3001'
    : 'https://misebox.app'

  return computed(() => ({
    copy: {
      title: 'QR menu',
      description: 'Upload a menu, choose a short path, and get a QR menu.',
      ctaLabel: 'Create QR menu',
      loadingLabel: 'Creating QR menu...',
      openTargetLabel: 'Open menu',
    },
    upload: {
      fileLabel: 'Menu file',
      accept: 'application/pdf,image/*,.doc,.docx',
      hint: 'Photo, PDF, DOC, or DOCX. Max 10 MB.',
    },
    slug: {
      label: 'Menu path',
      placeholder: 'my-menu',
      takenMessage: 'This menu path is already taken.',
    },
    preview: {
      baseUrl: `${consumerBaseUrl}/menus`,
      pathSuffix: '/qr',
    },
    endpoints: {
      create: `${consumerBaseUrl}/api/menus/create`,
      availability: `${consumerBaseUrl}/api/menus/availability`,
    },
  }))
}
