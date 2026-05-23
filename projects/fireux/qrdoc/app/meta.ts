import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const qrdocProductSentence = 'Turn any document into a public link and QR code.'

export const qrdocLanguage = {
  copy: {
    big_personality: 'Scan The Document',
    headline: 'Upload. Link. QR.',
    highlight_terms: [
      'document hosting',
      'QR code',
      'public link',
      'small business documents',
    ],
    positioning_html:
      'QRdocs turns a PDF, image, or document into a <strong>public URL and QR code</strong> without needing a full app.',
    promise_html:
      'Upload the document, share the link, print the QR code, and let customers open the right information on their phone.',
    console_bridge_html:
      'QRdocs owns document hosting and QR links. Sproochli can later plug in as a translation and localisation layer.',
    about_p1:
      'QRdocs is for small businesses that already have a document and simply need customers to scan it.',
    about_p2:
      'The MVP starts with seeded public documents, then grows into upload, storage, and owner-managed QR documents.',
  },
  seo: {
    title: 'QRdocs - Turn documents into QR codes',
    description:
      'Host a document publicly and generate a QR code for terms, menus, safety notices, guest guides, and business information.',
    keywords: [
      'document QR code',
      'host document online',
      'public document link',
      'QR code for business documents',
      'PDF QR code',
    ],
    audience: ['small businesses', 'hospitality teams', 'shops', 'venues'],
    categories: ['document hosting', 'QR codes', 'business tools'],
    primary_topic: 'document hosting with QR codes',
  },
  cta: {
    primary: {
      label: 'QRdocs home',
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
      'Public document URLs',
      'QR codes generated from each public URL',
      'Simple document pages for phones',
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
      purpose: 'A hosted public document with a stable slug, file URL, and QR code.',
    },
    {
      id: 'DocumentFile',
      purpose: 'The uploaded PDF, image, or document shown on the public page.',
    },
    {
      id: 'QrCode',
      purpose: 'A generated QR image that resolves to the public document URL.',
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
