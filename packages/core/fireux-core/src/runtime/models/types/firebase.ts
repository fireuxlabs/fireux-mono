// packages/core/fireux-core/src/runtime/models/types/firebase.ts

// Single canonical Firestore timestamp type for the whole codebase
export type FirebaseTimestamp = {
  /** Seconds since epoch */
  seconds: number
  /** Nanoseconds offset */
  nanoseconds: number
}
