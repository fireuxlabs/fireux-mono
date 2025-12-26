// packages/core/fireux-core/src/types/firebase.ts

/**
 * Tagged Firestore timestamp snapshot used across FireUX services.
 */
export interface FirestoreTimestamp {
  type: 'firestore/timestamp/1.0'
  seconds: number
  nanoseconds: number
}

/**
 * Firestore timestamps returned by some SDK paths omit the tag.
 */
export type FirebaseTimestamp = Omit<FirestoreTimestamp, 'type'>

/**
 * Convenience union for APIs that accept ISO strings or Firestore timestamps.
 */
export type FirestoreTimestampOrString =
  | FirestoreTimestamp
  | FirebaseTimestamp
  | string
