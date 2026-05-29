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
      'Doc URLs',
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
      slug: 'doc',
      title: 'Doc',
      description: 'Upload a doc, choose a short path, and get a QR page.',
      icon: 'i-lucide-file-text',
      cta: {
        label: 'Create doc QR',
        to: '/solutions/doc',
      },
    },
    {
      slug: 'url',
      title: 'URL',
      description: 'Turn a URL into a scannable QR code.',
      icon: 'i-lucide-link',
      cta: {
        label: 'Create URL QR',
        to: '/solutions/url',
      },
    },
    {
      slug: 'pdf',
      title: 'PDF',
      description: 'Upload a PDF and give people a QR code that opens it.',
      icon: 'i-lucide-file',
      cta: {
        label: 'Upload PDF',
        to: '/solutions/pdf',
      },
    },
    {
      slug: 'wifi',
      title: 'Wi-Fi',
      description: 'Create a QR code that lets guests join a Wi-Fi network.',
      icon: 'i-lucide-wifi',
      cta: {
        label: 'Create Wi-Fi QR',
        to: '/solutions/wifi',
      },
    },
    {
      slug: 'phone',
      title: 'Phone',
      description: 'Create a QR code that starts a phone call.',
      icon: 'i-lucide-phone',
      cta: {
        label: 'Create phone QR',
        to: '/solutions/phone',
      },
    },
    {
      slug: 'whatsapp',
      title: 'WhatsApp',
      description: 'Create a QR code that opens a WhatsApp chat.',
      icon: 'i-lucide-message-circle',
      cta: {
        label: 'Create WhatsApp QR',
        to: '/solutions/whatsapp',
      },
    },
    {
      slug: 'location',
      title: 'Location',
      description: 'Create a QR code that opens a location or map pin.',
      icon: 'i-lucide-map-pin',
      cta: {
        label: 'Create location QR',
        to: '/solutions/location',
      },
    },
    {
      slug: 'vcard',
      title: 'vCard',
      description: 'Create a QR code that saves contact details.',
      icon: 'i-lucide-contact',
      cta: {
        label: 'Create vCard QR',
        to: '/solutions/vcard',
      },
    },
    {
      slug: 'event',
      title: 'Event',
      description: 'Create a QR code for event details, timing, location, or instructions.',
      icon: 'i-lucide-calendar-days',
      cta: {
        label: 'Create event QR',
        to: '/solutions/event',
      },
    },
    {
      slug: 'review-link',
      title: 'Review link',
      description: 'Create a QR code that sends customers to a review page.',
      icon: 'i-lucide-star',
      cta: {
        label: 'Create review QR',
        to: '/solutions/review-link',
      },
    },
    {
      slug: 'feedback-link',
      title: 'Feedback link',
      description: 'Create a QR code that opens a feedback or survey form.',
      icon: 'i-lucide-clipboard-list',
      cta: {
        label: 'Create feedback QR',
        to: '/solutions/feedback-link',
      },
    },
    {
      slug: 'booking-link',
      title: 'Booking link',
      description: 'Create a QR code that opens a booking or appointment link.',
      icon: 'i-lucide-calendar-check',
      cta: {
        label: 'Create booking QR',
        to: '/solutions/booking-link',
      },
    },
  ] satisfies FireuxMetaSolution[],
  entities: [
    {
      id: 'GoQrRecord',
      purpose: 'A hosted public doc with a stable doc slug, file URL, and QR code.',
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
