import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const qrdocProductSentence = 'Upload a doc. Get a QR code.'

export const qrdocLanguage = {
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
      'QRdocs turns a public doc into a <strong>shareable QR page</strong>.',
    promise_html:
      'Upload the doc, share the link, print the QR code, and let people open the right information on their phone.',
    console_bridge_html:
      'QRdocs owns doc hosting and QR links. Sproochli can later plug in as a translation and localisation layer.',
    about_p1:
      'QRdocs is for public information people need to scan and read.',
    about_p2:
      'Create your first QRdoc free. More owner-managed doc tools can come later.',
  },
  seo: {
    title: 'QRdocs - Upload a doc. Get a QR code.',
    description:
      'Turn a public doc into a shareable QR page. Create your first QRdoc free.',
    keywords: [
      'doc QR code',
      'host doc online',
      'public doc link',
      'QR code for docs',
      'QRdoc',
    ],
    audience: ['small businesses', 'hospitality teams', 'shops', 'venues'],
    categories: ['doc hosting', 'QR codes', 'business tools'],
    primary_topic: 'doc hosting with QR codes',
  },
  cta: {
    primary: {
      label: 'Create your first QRdoc free',
      to: '/',
    },
    secondary: {
      label: 'Document QR',
      to: '/',
    },
    console: {
      label: 'QRdocs',
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
  entities: [
    {
      id: 'QrdocDocument',
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
QrdocDocument
  -> DocumentFile
  -> QrCode

`,
}

export const metaContent = defineFireuxMeta({
  app: {
    id: 'qrdoc',
    name: 'QRdocs',
    ecosystem: 'fireux',
  },
  ...qrdocLanguage,
})
