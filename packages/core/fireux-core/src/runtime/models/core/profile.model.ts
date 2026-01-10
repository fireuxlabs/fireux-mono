/**
 * Core profile doc base shape (global truth)
 * Example path: /chefs/<uid>, /agents/<uid>, /professionals/<uid>, etc.
 */
export interface CoreProfileBase {
  /** Canonical Firestore id (== Firebase Auth UID) */
  id: string

  /** Main title for pill/cell/etc */
  title: string

  /** Secondary subtitle for pill/cell/etc */
  subtitle: string

  /** Stored labels/tags (UI can derive badges from these). */
  tags: string[]
}

/**
 * App profile overlay base shape (tenant truth)
 * Example path: /apps/<appId>/<collection>/<uid>
 *
 * Delta-only by design.
 * Keep it minimal until you truly need overlay fields.
 */
export interface AppProfileBase {
  id: string
}

/**
 * Config describing how a profile collection behaves.
 */
export interface ProfileConfig {
  /** Lowercase identifier like 'chef', 'supplier', 'agent', 'professional' */
  id: string

  /** Firestore collection name */
  collectionName: string

  /** Human-readable label */
  profileType: string

  /** CTA text for UI when profile missing */
  cta: string

  /** Label override for nav/dropdown contexts */
  navLabel: string

  /** Icon to reuse across nav/dropdown contexts */
  navIcon: string
}
