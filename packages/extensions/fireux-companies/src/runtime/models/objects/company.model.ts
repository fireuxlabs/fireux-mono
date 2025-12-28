/**
 * Company (core entity)
 * Firestore: companies/{companyId}
 *
 * Phase-1: dead identity object (no relationships/permissions).
 */
export interface Company {
  /** Firestore document ID (auto/uuid). Often attached by FireUX fetch helpers. */
  id?: string

  /** Display name */
  name: string

  /** Optional website (used for identity + enrichment later) */
  website?: string | null

  /** Optional logo URL for rendering */
  logo_url?: string | null
}

export type CompanyCreateInput = Pick<Company, 'name' | 'website' | 'logo_url'>
export type CompanyUpdateInput = Partial<CompanyCreateInput>
