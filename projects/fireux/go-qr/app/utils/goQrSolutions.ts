export interface GoQrSolutionInstruction {
  title: string
  icon: string
  body: string
}

export interface GoQrSolutionLink {
  label: string
  to: string
}

export interface GoQrSolutionConsumer {
  name: string
  icon: string
  to: string
  cta: string
  useGoQr: string
  useApp: string
  external?: boolean
}

export interface GoQrSolutionEndpoint {
  method: string
  path: string
  description: string
}

export interface GoQrSolutionExample {
  title: string
  code: string
}

export interface GoQrSolution {
  title: string
  description: string
  intro: string
  badge?: string
  instructions?: GoQrSolutionInstruction[]
  integrations?: {
    body: string
    links?: GoQrSolutionLink[]
    consumers?: GoQrSolutionConsumer[]
  }
  upgrades?: string[]
  dev?: {
    endpoints?: GoQrSolutionEndpoint[]
    examples?: GoQrSolutionExample[]
  }
  seo: {
    title: string
    ogTitle: string
    twitterTitle: string
    description: string
    ogDescription: string
    twitterDescription: string
  }
}

type GoQrSolutionSeed = Omit<GoQrSolution, 'seo'>

const toInstruction = ([title, icon, body]: string[]) => ({ title, icon, body })
const toEndpoint = ([method, path, description]: string[]) => ({ method, path, description })
const instantDev = (slug: string) => ({
  endpoints: [
    ['GET', `/api/tools/${slug}`, `Read the ${slug} tool contract when this primitive gets a stored provider API.`],
    ['POST', `/api/tools/${slug}/create`, `Create a ${slug} QR record when this primitive is promoted beyond instant generation.`],
  ].map(toEndpoint),
})
const withSeo = (slug: string, solution: GoQrSolutionSeed): GoQrSolution => ({
  ...solution,
  seo: {
    title: `${solution.title} - Go QR`,
    ogTitle: `${solution.title} - Go QR`,
    twitterTitle: `${solution.title} - Go QR`,
    description: solution.description,
    ogDescription: solution.description,
    twitterDescription: solution.description,
  },
})
const comingSoonSolution = (
  slug: string,
  title: string,
  description: string,
  icon: string,
  example: string,
): GoQrSolution => withSeo(slug, {
  title,
  description,
  badge: 'Coming soon',
  intro: `${description} This page is ready as a Go QR primitive, and the generator tool will be added here.`,
  instructions: [
    ['Input', icon, `Enter the ${title.toLowerCase()} details once the tool is available.`],
    ['Path out', 'i-lucide-route', `Use a short path like /${slug}/${example} when this primitive needs a stable page.`],
    ['QR ready', 'i-lucide-qr-code', 'Generate a QR code for printing, labels, counters, cards, posters, or handouts.'],
  ].map(toInstruction),
  integrations: {
    body: `${title} stays a Go QR primitive. Industry-specific meaning should live in the consuming app, while Go QR owns the QR mechanics.`,
    links: [
      { label: 'Text', to: '/solutions/text' },
      { label: 'Doc', to: '/solutions/doc' },
      { label: 'URL', to: '/solutions/url' },
    ],
  },
  upgrades: [
    'Sign in to manage saved QR records.',
    'Add a logo or centre mark before printing stickers.',
    'Export print sizes for labels, table cards, and posters.',
  ],
  dev: instantDev(slug),
})

const docClientExample = `const goQr = createGoQrClient({
  baseUrl: 'https://go-qr.web.app'
})

const appInfo = await goQr.appInfo()
const tool = await goQr.publicDoc.config()
const availability = await goQr.publicDoc.availability('my-doc')

if (availability.available) {
  const result = await goQr.publicDoc.create({
    slug: 'my-doc',
    file
  })
}`

const docRequestExample = `const form = new FormData()
form.append('slug', 'my-doc')
form.append('file', file)

const result = await fetch('https://go-qr.web.app/api/tools/doc/create', {
  method: 'POST',
  body: form
}).then((response) => response.json())`

const docResponseExample = `{
  "ok": true,
  "slug": "my-doc",
  "path": "/doc/my-doc",
  "qr_path": "/doc/my-doc/qr"
}`

export const goQrSolutions = {
  text: {
    title: 'Text',
    description: 'Send any message as a QR code.',
    intro: 'Write a short message and publish it as a QR page.',
    instructions: [
      ['Text', 'i-lucide-type', 'Enter the message.'],
      ['Path', 'i-lucide-qr-code', 'Choose `/text/my-text`.'],
      ['QR', 'i-lucide-share-2', 'Print or share the QR page.'],
    ].map(toInstruction),
    integrations: {
      body: 'Use Text for quick notes.',
      links: [
        { label: 'URL', to: '/solutions/url' },
        { label: 'Phone', to: '/solutions/phone' },
        { label: 'Doc', to: '/solutions/doc' },
      ],
    },
    upgrades: [
      'Sign in to manage, replace, or delete saved text QR records.',
      'Add a logo or centre mark before printing stickers.',
      'Export print sizes for labels, table cards, and posters.',
    ],
    dev: {
      endpoints: [
        ['GET', '/api/tools/text', 'Read the Text tool contract: labels, slug rules, endpoints, and preview URL shape.'],
        ['GET', '/api/tools/text/availability?id=my-text', 'Check whether a text path is valid and available before creating it.'],
        ['POST', '/api/tools/text/create', 'Create a stored text QR record under /text/{slug}.'],
      ].map(toEndpoint),
    },
    seo: {
      title: 'Text - Go QR',
      ogTitle: 'Text - Go QR',
      twitterTitle: 'Text - Go QR',
      description: 'Send any message as a QR code with Go QR.',
      ogDescription: 'Send any message as a QR code with Go QR.',
      twitterDescription: 'Send any message as a QR code with Go QR.',
    },
  },
  doc: {
    title: 'Doc',
    description: 'Upload a doc, choose a short path, and get a QR page.',
    intro: 'Upload a doc and publish it as a QR page.',
    instructions: [
      ['File', 'i-lucide-file-up', 'Upload a PDF, image, DOC, or DOCX.'],
      ['Path', 'i-lucide-link', 'Choose `/doc/my-doc`.'],
      ['QR', 'i-lucide-cloud', 'Open the hosted doc or QR page.'],
    ].map(toInstruction),
    integrations: {
      body: 'Use Doc when the file is already finished.',
      consumers: [
        ['Misebox', 'i-lucide-utensils', 'https://misebox.app/solutions/qr-menu', 'Food menu flow', 'Finished menu file.', 'Structured menu app.'],
        ['BuenoHost', 'i-lucide-house', 'https://buenohost.web.app', 'Guest guide flow', 'Finished guide file.', 'Property-aware guest guide.'],
        ['Sproochli', 'i-lucide-languages', 'https://sproochli.web.app', 'Translation flow', 'Finished translated file.', 'Translation workflow.'],
      ].map(([name, icon, to, cta, useGoQr, useApp]) => ({ name, icon, to, cta, useGoQr, useApp, external: true })),
    },
    upgrades: [
      'Sign in to manage, replace, or delete uploaded docs.',
      'Add a logo or centre mark before printing stickers.',
      'Set expiry, replacement, and simple access controls for public files.',
    ],
    dev: {
      endpoints: [
        ['GET', '/api/public/app/info', 'Read Go QR app identity, public branding, and media from the shared FireUX app-info endpoint.'],
        ['GET', '/api/tools/doc', 'Read the doc tool contract: labels, slug rules, limits, endpoints, and preview URL shape.'],
        ['GET', '/api/tools/doc/availability?id=my-doc', 'Check whether a public document path is valid and available before creating it.'],
        ['POST', '/api/tools/doc/create', 'Upload a public file with a slug. The doc tool owns the internal doc type.'],
      ].map(toEndpoint),
      examples: [
        { title: 'Client wrapper shape', code: docClientExample },
        { title: 'Multipart request', code: docRequestExample },
        { title: 'Create response', code: docResponseExample },
      ],
    },
    seo: {
      title: 'Doc - Go QR',
      ogTitle: 'Doc - Go QR',
      twitterTitle: 'Doc - Go QR',
      description: 'Upload a doc and get a QR page.',
      ogDescription: 'Upload a doc and get a QR page.',
      twitterDescription: 'Upload a doc and get a QR page.',
    },
  },
  url: withSeo('url', {
    title: 'URL',
    description: 'Turn a URL into a scannable QR code.',
    badge: 'Typed helper',
    intro: 'Use URL when the destination already exists somewhere else. Go QR normalizes the address, generates the QR, and stays out of the business workflow behind that link.',
    instructions: [
      ['Paste a destination', 'i-lucide-link', 'Use an existing website, form, booking page, menu page, or public app route.'],
      ['Normalize', 'i-lucide-check-circle-2', 'Go QR adds a missing scheme and only accepts normal web links.'],
      ['No hosting', 'i-lucide-route', 'The QR points to the external destination. Go QR does not copy or own that content.'],
    ].map(toInstruction),
    integrations: {
      body: 'Use URL for booking links, review pages, feedback forms, map links, public pages, and any destination owned by another app or service. If Go QR should host the file itself, use doc.',
      links: [
        { label: 'Text', to: '/solutions/text' },
        { label: 'Doc', to: '/solutions/doc' },
      ],
    },
    upgrades: [
      'Sign in to save and manage URL QR records.',
      'Add a logo or centre mark before printing stickers.',
      'Track and replace destinations without reprinting later.',
    ],
    dev: instantDev('url'),
  }),
  phone: withSeo('phone', {
    title: 'Phone',
    description: 'Create a QR code that starts a phone call.',
    badge: 'Typed helper',
    intro: 'Phone creates a QR code for a call action. It is useful for signs, counters, rooms, support cards, delivery notices, and places where typing a number is annoying.',
    instructions: [
      ['Enter a number', 'i-lucide-phone', 'Use an international phone number where possible, including the country code.'],
      ['Call link', 'i-lucide-phone-call', 'Go QR generates a tel: link so most phones offer a call action after scanning.'],
      ['Print ready', 'i-lucide-printer', 'Download the QR for reception desks, room cards, delivery notes, or support signs.'],
    ].map(toInstruction),
    integrations: {
      body: 'Use Phone when scanning should start a call. Use URL when the scan should open a booking form, WhatsApp link, help page, or another richer destination.',
      links: [
        { label: 'URL', to: '/solutions/url' },
        { label: 'Text', to: '/solutions/text' },
      ],
    },
    upgrades: [
      'Sign in to save and manage phone QR records.',
      'Add a logo or centre mark before printing stickers.',
      'Create contact sets for branches, rooms, desks, or support teams.',
    ],
    dev: instantDev('phone'),
  }),
  pdf: comingSoonSolution(
    'pdf',
    'PDF',
    'Upload a PDF and give people a QR code that opens it.',
    'i-lucide-file',
    'my-pdf',
  ),
  wifi: comingSoonSolution(
    'wifi',
    'Wi-Fi',
    'Create a QR code that lets guests join a Wi-Fi network.',
    'i-lucide-wifi',
    'guest-wifi',
  ),
  whatsapp: comingSoonSolution(
    'whatsapp',
    'WhatsApp',
    'Create a QR code that opens a WhatsApp chat.',
    'i-lucide-message-circle',
    'front-desk',
  ),
  location: comingSoonSolution(
    'location',
    'Location',
    'Create a QR code that opens a location or map pin.',
    'i-lucide-map-pin',
    'shop',
  ),
  vcard: comingSoonSolution(
    'vcard',
    'vCard',
    'Create a QR code that saves contact details.',
    'i-lucide-contact',
    'daniel',
  ),
  event: comingSoonSolution(
    'event',
    'Event',
    'Create a QR code for event details, timing, location, or instructions.',
    'i-lucide-calendar-days',
    'opening-night',
  ),
  'review-link': comingSoonSolution(
    'review-link',
    'Review link',
    'Create a QR code that sends customers to a review page.',
    'i-lucide-star',
    'google-review',
  ),
  'feedback-link': comingSoonSolution(
    'feedback-link',
    'Feedback link',
    'Create a QR code that opens a feedback or survey form.',
    'i-lucide-clipboard-list',
    'guest-feedback',
  ),
  'booking-link': comingSoonSolution(
    'booking-link',
    'Booking link',
    'Create a QR code that opens a booking or appointment link.',
    'i-lucide-calendar-check',
    'table-booking',
  ),
} satisfies Record<string, GoQrSolution>

export type GoQrSolutionSlug = keyof typeof goQrSolutions
