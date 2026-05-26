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
      status: 'live',
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
      status: 'live',
    },
    {
      slug: 'pdf-qr-code',
      title: 'PDF QR code',
      description: 'Upload a PDF and give people a QR code that opens it.',
      icon: 'i-lucide-file',
      status: 'very-easy',
      cta: {
        label: 'Upload PDF',
        to: '/',
      },
    },
    {
      slug: 'wifi-qr-code',
      title: 'Wi-Fi QR code',
      description: 'Create a QR code that lets guests join a Wi-Fi network.',
      icon: 'i-lucide-wifi',
      status: 'very-easy',
    },
    {
      slug: 'phone-call-qr-code',
      title: 'Phone call QR code',
      description: 'Create a QR code that starts a phone call.',
      icon: 'i-lucide-phone',
      status: 'live',
    },
    {
      slug: 'whatsapp-qr-code',
      title: 'WhatsApp QR code',
      description: 'Create a QR code that opens a WhatsApp chat.',
      icon: 'i-lucide-message-circle',
      status: 'very-easy',
    },
    {
      slug: 'map-pin-qr-code',
      title: 'Map pin QR code',
      description: 'Create a QR code that opens a location or map pin.',
      icon: 'i-lucide-map-pin',
      status: 'very-easy',
    },
    {
      slug: 'vcard-qr-code',
      title: 'vCard QR code',
      description: 'Create a QR code that saves contact details.',
      icon: 'i-lucide-contact',
      status: 'very-easy',
    },
    {
      slug: 'event-info-qr-code',
      title: 'Event info QR code',
      description: 'Create a QR code for event details, timing, location, or instructions.',
      icon: 'i-lucide-calendar-days',
      status: 'very-easy',
    },
    {
      slug: 'review-link-qr-code',
      title: 'Review link QR code',
      description: 'Create a QR code that sends customers to a review page.',
      icon: 'i-lucide-star',
      status: 'very-easy',
    },
    {
      slug: 'feedback-form-qr-code',
      title: 'Feedback form QR code',
      description: 'Create a QR code that opens a feedback or survey form.',
      icon: 'i-lucide-clipboard-list',
      status: 'very-easy',
    },
    {
      slug: 'booking-link-qr-code',
      title: 'Booking link QR code',
      description: 'Create a QR code that opens a booking or appointment link.',
      icon: 'i-lucide-calendar-check',
      status: 'very-easy',
    },
    {
      slug: 'food-menu-qr-code',
      title: 'Food menu QR code',
      description: 'Upload a menu doc with Go QR, or move to Misebox for editable dishes.',
      icon: 'i-lucide-utensils',
      status: 'live',
      relatedApp: {
        name: 'Misebox',
        to: 'https://misebox.app',
        external: true,
        description:
          'Misebox owns the deeper editable menu workflow: dishes, sections, prices, allergens, translations, and ordering.',
      },
    },
    {
      slug: 'guest-guide-qr-code',
      title: 'Guest guide QR code',
      description: 'Create a QR code for guest instructions, house rules, Wi-Fi, and local notes.',
      icon: 'i-lucide-book-open',
      status: 'bridge',
      relatedApp: {
        name: 'BuenoHost',
        to: 'https://buenohost.web.app',
        external: true,
        description:
          'BuenoHost owns structured guest guides and digital stay companions.',
      },
    },
    {
      slug: 'multilingual-qr-pages',
      title: 'Multilingual QR pages',
      description: 'Create QR pages for public information in more than one language.',
      icon: 'i-lucide-languages',
      status: 'bridge',
      relatedApp: {
        name: 'Sproochli',
        to: 'https://sproochli.web.app',
        external: true,
        description:
          'Sproochli owns multilingual QR pages and translation/localisation workflows.',
      },
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
