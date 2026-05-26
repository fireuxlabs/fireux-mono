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
      body:
        'Use Go QR when you need one public document to become one scannable public page.',
      steps: [
        'Upload the public document.',
        'Choose the short public path people will scan.',
        'Go QR hosts the page and creates the QR code.',
      ],
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
      body:
        'Use this when the destination already exists and you just need a clean QR code for it.',
      steps: [
        'Paste the URL.',
        'Go QR validates the destination and generates the QR.',
        'Use the QR on a poster, counter sign, flyer, label, or screen.',
      ],
    },
    {
      slug: 'pdf-qr-code',
      title: 'PDF QR code',
      description: 'Upload a PDF and give people a QR code that opens it.',
      icon: 'i-lucide-file',
      status: 'very-easy',
      body:
        'PDF QR is the focused version of public doc QR for menus, notices, terms, forms, and information sheets.',
      steps: [
        'Upload a PDF.',
        'Choose a short public path.',
        'Go QR hosts the PDF page and gives you a printable QR code.',
      ],
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
      body:
        'Wi-Fi QR will turn network details into a scannable code for guest rooms, counters, offices, and events.',
      steps: [
        'Enter the network name and password.',
        'Choose the security type if needed.',
        'Go QR creates a Wi-Fi QR code ready for printing.',
      ],
    },
    {
      slug: 'phone-call-qr-code',
      title: 'Phone call QR code',
      description: 'Create a QR code that starts a phone call.',
      icon: 'i-lucide-phone',
      status: 'live',
      body:
        'Use a phone call QR when the best next action is simply calling the business, host, venue, or support number.',
      steps: [
        'Enter the phone number.',
        'Go QR creates a tel link QR code.',
        'People scan it and their phone prepares the call.',
      ],
    },
    {
      slug: 'whatsapp-qr-code',
      title: 'WhatsApp QR code',
      description: 'Create a QR code that opens a WhatsApp chat.',
      icon: 'i-lucide-message-circle',
      status: 'very-easy',
      body:
        'WhatsApp QR is useful for support, bookings, quick questions, group joins, and local business contact.',
      steps: [
        'Enter the WhatsApp number or invite link.',
        'Optionally add a starter message.',
        'Go QR creates a code that opens the chat flow.',
      ],
    },
    {
      slug: 'map-pin-qr-code',
      title: 'Map pin QR code',
      description: 'Create a QR code that opens a location or map pin.',
      icon: 'i-lucide-map-pin',
      status: 'very-easy',
      body:
        'Map pin QR helps people find places that are hard to explain on signs, posters, event pages, and printed directions.',
      steps: [
        'Enter coordinates or a map URL.',
        'Choose the preferred map destination where useful.',
        'Go QR creates a QR code that opens the location.',
      ],
    },
    {
      slug: 'vcard-qr-code',
      title: 'vCard QR code',
      description: 'Create a QR code that saves contact details.',
      icon: 'i-lucide-contact',
      status: 'very-easy',
      body:
        'vCard QR is for business cards, reception desks, events, sales teams, and service contacts.',
      steps: [
        'Enter name, phone, email, company, and website.',
        'Go QR formats the contact card.',
        'People scan it and save the contact on their phone.',
      ],
    },
    {
      slug: 'event-info-qr-code',
      title: 'Event info QR code',
      description: 'Create a QR code for event details, timing, location, or instructions.',
      icon: 'i-lucide-calendar-days',
      status: 'very-easy',
      body:
        'Event info QR gives attendees a simple scan point for schedules, joining notes, venue details, and last-minute updates.',
      steps: [
        'Add event title, time, location, and key details.',
        'Go QR creates a public event information page.',
        'Share the QR on posters, tickets, tables, or screens.',
      ],
    },
    {
      slug: 'review-link-qr-code',
      title: 'Review link QR code',
      description: 'Create a QR code that sends customers to a review page.',
      icon: 'i-lucide-star',
      status: 'very-easy',
      body:
        'Review link QR makes it easier to collect Google, Tripadvisor, booking, or platform reviews at the right moment.',
      steps: [
        'Paste the review destination URL.',
        'Go QR creates a scannable review link.',
        'Place it on receipts, counters, rooms, or follow-up cards.',
      ],
    },
    {
      slug: 'feedback-form-qr-code',
      title: 'Feedback form QR code',
      description: 'Create a QR code that opens a feedback or survey form.',
      icon: 'i-lucide-clipboard-list',
      status: 'very-easy',
      body:
        'Feedback form QR is for collecting simple responses from guests, customers, attendees, or staff.',
      steps: [
        'Paste a form URL or create a simple feedback page.',
        'Go QR creates a QR code for the form.',
        'People scan it and submit feedback on their phone.',
      ],
    },
    {
      slug: 'booking-link-qr-code',
      title: 'Booking link QR code',
      description: 'Create a QR code that opens a booking or appointment link.',
      icon: 'i-lucide-calendar-check',
      status: 'very-easy',
      body:
        'Booking link QR helps people move from a poster, menu, table talker, flyer, or sign into a booking flow.',
      steps: [
        'Paste the booking URL.',
        'Go QR turns it into a scannable booking code.',
        'People scan and continue in the booking system you already use.',
      ],
    },
    {
      slug: 'food-menu-qr-code',
      title: 'Food menu QR code',
      description: 'Upload a menu doc with Go QR, or move to Misebox for editable dishes.',
      icon: 'i-lucide-utensils',
      status: 'live',
      body:
        'Go QR can host a menu file today. Misebox is the next step when the menu needs dishes, sections, prices, allergens, translations, or ordering.',
      steps: [
        'Upload the menu file if it is already a finished document.',
        'Use the generated QR code on tables, windows, flyers, or signs.',
        'Move to Misebox when the menu needs to become structured hospitality data.',
      ],
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
      body:
        'Go QR can host a guest guide document. BuenoHost is the deeper app when guest information should become editable, reusable, and property-aware.',
      steps: [
        'Use Go QR for a simple guest guide document.',
        'Use BuenoHost when the guide needs structured check-in, Wi-Fi, rules, recommendations, and host tools.',
        'Print the QR where guests naturally need it.',
      ],
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
      body:
        'Go QR handles the scannable public page. Sproochli is the deeper app when that page needs translation and localisation.',
      steps: [
        'Start with one public Go QR page or document.',
        'Move to Sproochli when the information needs language versions.',
        'Let visitors scan once and choose the language they need.',
      ],
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
