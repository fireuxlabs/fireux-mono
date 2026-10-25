# Firestore Rules source map

Updated: 2026-10-25
Ref: ce2861c77
Role: map, not canon

## Purpose and authority

Map ownership of FireUX's main-database Firestore Security Rules. Firebase
defines Rules behavior; use the official
[Firestore security overview](https://firebase.google.com/docs/firestore/security/overview)
and [Rules conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)
for framework mechanics.

Authored templates are not proof of deployed policy. Check the target project
and database and read back deployed Rules before making a live-state claim.

## Source ownership

- Core owns reusable fragments and the
  [Rules composer](../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs).
- Each opted-in Ecosystem owns its firestore.template.rules file and named
  policy fragments beside its Firebase configuration.
- A template declares how Core fragments and the Ecosystem policy compose. The
  Ecosystem policy remains explicit; similar syntax does not make two policies
  interchangeable.
- App-owned release code selects and verifies the exact artifact for its target.
  Do not infer a deployment command from a template path or this map.

## Security boundary

Firestore Rules govern client SDK requests. Firebase Admin/server SDKs use
server IAM and bypass Firestore Rules, so protected server commands must enforce
domain authority independently. Rules are not filters and do not restrict
server-side queries.

The accepted open-development policy is described in the
[Firestore mutation context](../ai/firestore-mutations-context.md). It is an
explicit development choice within its named targets, not a privacy boundary or
shipping approval. Storage Rules and Authentication configuration are separate
policies.

## Verification and release

Verify the target App/Ecosystem binding, named database, composed source,
available Rules checks and release owner before a policy change. A source change
does not change deployed Rules. An authorized release must verify the exact
target and source and read back the resulting deployed policy.

Keep deployment steps and current operational controls in the owning App or
Ecosystem context. Do not restore retired generic renderer or release commands
from historical docs. See the [Firestore Entity map](firestore-entity.md) for
data ownership and [mutation context](../ai/firestore-mutations-context.md)
for command authority and migration boundaries.
