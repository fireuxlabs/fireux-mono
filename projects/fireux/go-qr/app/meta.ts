import {
  defineFireuxMeta,
  type FireuxMetaSolution,
} from 'fireux-core/runtime/models/system/meta-content.model'

export const goQrProductSentence =
  'Turn one public thing into a scannable QR page or QR code.'

export const goQrLanguage = {
  copy: {
    big_personality: 'Scan The Doc',
    headline: 'Turn one public thing into a QR code.',
    highlight_terms: [
      'doc hosting',
      'QR code',
      'public link',
      'small business docs',
    ],
    positioning_html:
      'Go QR turns a public document, link, menu, guide, or contact action into a <strong>scannable QR page or QR code</strong>.',
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
      slug: 'qr',
      title: 'Text',
      description: 'Send any message as a downloadable QR code.',
      icon: 'i-lucide-qr-code',
      cta: {
        label: 'Create text QR',
        to: '/solutions/qr',
      },
    },
    {
      slug: 'public-doc',
      title: 'Public doc',
      description: 'Upload a public doc, choose a short path, and get a QR page.',
      icon: 'i-lucide-file-text',
      cta: {
        label: 'Create doc QR',
        to: '/',
      },
    },
    {
      slug: 'url',
      title: 'URL',
      description: 'Turn a URL into a scannable QR code.',
      icon: 'i-lucide-link',
    },
    {
      slug: 'pdf',
      title: 'PDF',
      description: 'Upload a PDF and give people a QR code that opens it.',
      icon: 'i-lucide-file',
      cta: {
        label: 'Upload PDF',
        to: '/',
      },
    },
    {
      slug: 'wifi',
      title: 'Wi-Fi',
      description: 'Create a QR code that lets guests join a Wi-Fi network.',
      icon: 'i-lucide-wifi',
    },
    {
      slug: 'phone',
      title: 'Phone',
      description: 'Create a QR code that starts a phone call.',
      icon: 'i-lucide-phone',
    },
    {
      slug: 'whatsapp',
      title: 'WhatsApp',
      description: 'Create a QR code that opens a WhatsApp chat.',
      icon: 'i-lucide-message-circle',
    },
    {
      slug: 'location',
      title: 'Location',
      description: 'Create a QR code that opens a location or map pin.',
      icon: 'i-lucide-map-pin',
    },
    {
      slug: 'vcard',
      title: 'vCard',
      description: 'Create a QR code that saves contact details.',
      icon: 'i-lucide-contact',
    },
    {
      slug: 'event',
      title: 'Event',
      description: 'Create a QR code for event details, timing, location, or instructions.',
      icon: 'i-lucide-calendar-days',
    },
    {
      slug: 'review-link',
      title: 'Review link',
      description: 'Create a QR code that sends customers to a review page.',
      icon: 'i-lucide-star',
    },
    {
      slug: 'feedback-link',
      title: 'Feedback link',
      description: 'Create a QR code that opens a feedback or survey form.',
      icon: 'i-lucide-clipboard-list',
    },
    {
      slug: 'booking-link',
      title: 'Booking link',
      description: 'Create a QR code that opens a booking or appointment link.',
      icon: 'i-lucide-calendar-check',
    },
  ] satisfies FireuxMetaSolution[],
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
