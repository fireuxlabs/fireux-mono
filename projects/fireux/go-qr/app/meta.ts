import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const goQrProductSentence = 'Upload a doc. Get a QR code.'

export const goQrLanguage = {
  copy: {
    big_personality: 'Scan The Doc',
    headline: 'Upload a doc. Get a QR code.',
    highlight_terms: [
      'doc hosting',
      'QR code',
      'public link',
      'small business docs',
    ],
    positioning_html:
      'Go QR turns a public doc into a <strong>shareable QR page</strong>.',
    promise_html:
      'Upload the doc, share the link, print the QR code, and let people open the right information on their phone.',
    console_bridge_html:
      'Go QR owns doc hosting and QR links. Sproochli can later plug in as a translation and localisation layer.',
    about_p1:
      'Go QR is for public information people need to scan and read.',
    about_p2:
      'Create your first QR doc free. More owner-managed doc tools can come later.',
  },
  seo: {
    title: 'Go QR - Upload a doc. Get a QR code.',
    description:
      'Turn a public doc into a shareable QR page. Create your first QR doc free.',
    keywords: [
      'doc QR code',
      'host doc online',
      'public doc link',
      'QR code for docs',
      'QR doc',
    ],
    audience: ['small businesses', 'hospitality teams', 'shops', 'venues'],
    categories: ['doc hosting', 'QR codes', 'business tools'],
    primary_topic: 'doc hosting with QR codes',
  },
  cta: {
    primary: {
      label: 'Create your first QR doc free',
      to: '/',
    },
    secondary: {
      label: 'Document QR',
      to: '/',
    },
    console: {
      label: 'Go QR',
      to: '/',
    },
  },
  lists: {
    hero_bullets: [
      'Public doc URLs',
      'QR codes generated from each public doc link',
      'Simple doc pages for phones',
    ],
    about_ticks: [
      'No translation needed for the base product',
      'No OCR or AI required for the MVP',
      'Sproochli can be added later as an upgrade',
    ],
  },
  solutions: [
    {
      slug: 'public-doc-qr-code',
      title: 'Public doc QR code',
      description: 'Upload a public doc, choose a short path, and get a QR page.',
      icon: 'i-lucide-file-text',
      cta: {
        label: 'Create doc QR',
        to: '/',
      },
    },
    {
      slug: 'url-qr-code',
      title: 'URL QR code',
      description: 'Turn a URL into a scannable QR code.',
      icon: 'i-lucide-link',
    },
    {
      slug: 'phone-qr-code',
      title: 'Phone QR code',
      description: 'Create a QR code that starts a phone call.',
      icon: 'i-lucide-phone',
    },
    {
      slug: 'food-menu-qr-code',
      title: 'Food menu QR code',
      description: 'Upload a menu doc with Go QR, or move to Misebox for editable dishes.',
      icon: 'i-lucide-utensils',
    },
    {
      slug: 'rental-terms-qr-code',
      title: 'Rental terms QR code',
      description: 'Share rental terms, participant agreements, or public conditions through one QR page.',
      icon: 'i-lucide-scroll-text',
    },
  ],
  entities: [
    {
      id: 'GoQrRecord',
      purpose: 'A hosted public doc with a stable slug, file URL, and QR code.',
    },
    {
      id: 'DocumentFile',
      purpose: 'The uploaded doc shown on the public page.',
    },
    {
      id: 'QrCode',
      purpose: 'A generated QR image that resolves to the public doc URL.',
    },
  ],
  relations_ascii: `
GoQrRecord
  -> DocumentFile
  -> QrCode

`,
}

export const metaContent = defineFireuxMeta({
  app: {
    id: 'go-qr',
    name: 'Go QR',
    ecosystem: 'fireux',
  },
  ...goQrLanguage,
})
