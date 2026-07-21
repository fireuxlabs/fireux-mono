// Concurrent edit — 2026-07-21 16:12 CEST — Shared Firestore Rules pass: bind helper provenance and literal-path frame semantics.

export const FIRESTORE_RULE_CORE_BLOCK_STACK = Object.freeze([
  'service cloud.firestore',
  'match /databases/{database}/documents',
])

export const FIRESTORE_RULE_SEMANTIC_UNIQUE_BLOCKS = Object.freeze([
  ...FIRESTORE_RULE_CORE_BLOCK_STACK,
  'match /apps/{appId}',
  'match /join-requests/{userId}',
])

export const FIRESTORE_RULE_FRAGMENTS = Object.freeze({
  open: Object.freeze({
    file: 'open.rules',
    scope: 'ruleset',
    indent: 0,
    blockStack: Object.freeze([]),
    requiresFunctions: Object.freeze([]),
  }),
  owner: Object.freeze({
    file: 'identity-owner.rules',
    scope: 'database',
    indent: 4,
    blockStack: FIRESTORE_RULE_CORE_BLOCK_STACK,
    requiresFunctions: Object.freeze(['function isAuthenticated()']),
  }),
  text: Object.freeze({
    file: 'validation-text.rules',
    scope: 'database',
    indent: 4,
    blockStack: FIRESTORE_RULE_CORE_BLOCK_STACK,
    requiresFunctions: Object.freeze([]),
  }),
  avatar: Object.freeze({
    file: 'validation-user-avatar.rules',
    scope: 'database',
    indent: 4,
    blockStack: FIRESTORE_RULE_CORE_BLOCK_STACK,
    requiresFunctions: Object.freeze([
      'function isValidHttpsUrl(value, maxSize)',
    ]),
  }),
  bounded: Object.freeze({
    file: 'validation-bounded-string.rules',
    scope: 'database',
    indent: 4,
    blockStack: FIRESTORE_RULE_CORE_BLOCK_STACK,
    requiresFunctions: Object.freeze([]),
  }),
  'owner-stamp': Object.freeze({
    file: 'validation-owner-update-stamp.rules',
    scope: 'database',
    indent: 4,
    blockStack: FIRESTORE_RULE_CORE_BLOCK_STACK,
    requiresFunctions: Object.freeze(['function validUpdatedStamp(value)']),
  }),
  'membership-path': Object.freeze({
    file: 'app-membership-path.rules',
    scope: 'database',
    indent: 4,
    blockStack: FIRESTORE_RULE_CORE_BLOCK_STACK,
    requiresFunctions: Object.freeze([]),
  }),
  'join-validator': Object.freeze({
    file: 'app-join-request-validator.rules',
    scope: 'app-join-request',
    indent: 8,
    blockStack: Object.freeze([
      ...FIRESTORE_RULE_CORE_BLOCK_STACK,
      'match /apps/{appId}',
      'match /join-requests/{userId}',
    ]),
    requiresFunctions: Object.freeze(['function validCreatedStamp(value)']),
  }),
  'membership-block': Object.freeze({
    file: 'app-membership-block-deny.rules',
    scope: 'app',
    indent: 6,
    blockStack: Object.freeze([
      ...FIRESTORE_RULE_CORE_BLOCK_STACK,
      'match /apps/{appId}',
    ]),
    requiresFunctions: Object.freeze([]),
  }),
  'overlay-validator': Object.freeze({
    file: 'app-profile-overlay-validator.rules',
    scope: 'app-profile-overlay',
    indent: 8,
    blockStack: Object.freeze([
      ...FIRESTORE_RULE_CORE_BLOCK_STACK,
      'match /apps/{appId}',
      'match /{profileCollection}/{userId}',
    ]),
    requiresFunctions: Object.freeze([
      'function validCreatedStamp(value)',
      'function validUpdatedStamp(value)',
    ]),
  }),
  close: Object.freeze({
    file: 'close.rules',
    scope: 'ruleset',
    indent: 0,
    blockStack: FIRESTORE_RULE_CORE_BLOCK_STACK,
    requiresFunctions: Object.freeze([]),
  }),
})

export const FIRESTORE_RULE_FRAGMENT_NAMES = Object.freeze(
  Object.keys(FIRESTORE_RULE_FRAGMENTS)
)
