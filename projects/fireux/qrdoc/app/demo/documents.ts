export type QrdocDocument = {
  id: string
  title: string
  slug: string
  business_name: string
  description: string
  file_url: string
  file_type: string
  file_name: string
  owner_id: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export const qrdocDocuments: QrdocDocument[] = [
  {
    id: 'yellow-velo-rental-terms',
    title: 'Terms and Conditions for Bicycle Rentals',
    slug: 'yellow-velo-rental-terms',
    business_name: 'Yellow Velo Interlaken',
    description: 'Customer-facing rental terms proof document from the supplied Yellow Velo photo.',
    file_url: '/docs/yellow-velo-rental-terms.png',
    file_type: 'image/png',
    file_name: 'yellow-velo-rental-terms.png',
    owner_id: 'demo-yellow-velo',
    is_public: true,
    created_at: '2026-05-22T00:00:00.000Z',
    updated_at: '2026-05-22T00:00:00.000Z',
  },
  {
    id: 'yellow-velo-tour-participant-agreement',
    title: 'Tour Participant Agreement',
    slug: 'yellow-velo-tour-participant-agreement',
    business_name: 'Yellow Velo Interlaken',
    description: 'Customer-facing tour participant agreement proof document from the supplied Yellow Velo photo.',
    file_url: '/docs/yellow-velo-tour-participant-agreement.png',
    file_type: 'image/png',
    file_name: 'yellow-velo-tour-participant-agreement.png',
    owner_id: 'demo-yellow-velo',
    is_public: true,
    created_at: '2026-05-22T00:00:00.000Z',
    updated_at: '2026-05-22T00:00:00.000Z',
  },
]

export function resolveQrdocDocument(slug: string): QrdocDocument | null {
  return qrdocDocuments.find((document) => document.slug === slug && document.is_public) || null
}
