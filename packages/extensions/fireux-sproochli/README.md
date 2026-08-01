# fireux-sproochli

Updated: 2026-08-01
Role: package entrypoint; implementation authority remains current source and guards

`fireux-sproochli` gives a host App Sproochli language selection, Menu
localization models, server-side provider transport, and host-local cache and
translation-memory helpers.

Sproochli localizes food content in context. Menu generation preserves dish,
ingredient, preparation, dietary, and allergen meaning; it is not a
word-for-word substitution seam. Generated output remains unreviewed and must
not be presented as reviewed safety, legal, or brand copy.

## Ownership

- The host owns its canonical content, `sproochli` Firestore database, cached
  translations, translation memory, authorization, and public projection.
- The central Sproochli provider owns bounded translation generation. It has no
  host database credentials and performs no host persistence.
- The browser selects a language. It never invokes the billable provider or
  writes translation records.

The installation invariant is: **one installation, one scoped host identity,
host-owned storage, centrally provided translation intelligence**.

## FireUX host registration

Adding `fireux-sproochli` to `app.modules` enables the package. It does not
complete production registration.

A production FireUX Firebase SSR host also requires:

1. a dedicated host SSR service account bound through
   `app.serverFunctionServiceAccount`;
2. a server-only named Firestore database called `sproochli` in the host
   Firebase project;
3. the minimum host-local IAM required for that server to use its own storage;
4. `SPROOCHLI_MENU_PROVIDER_ENDPOINT` and
   `SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE` set to the same exact HTTPS URL;
5. a matching central `SPROOCHLI_MENU_PROVIDER_SOURCE_SCOPES` grant containing
   the service-account email, host project, database, and permitted App ids;
6. a guarded deployment and live checks proving anonymous rejection and an
   authenticated call from the deployed host identity.

Do not use service-account keys, default compute identities, browser secrets,
Firebase CLI aliases, or provider access to host Firestore as shortcuts.
Non-secret deployment values belong in the App's `firebase.runtime-env.json`;
secrets and credentials do not.

Misebox is the first production proof. Its current registration is guarded in
`scripts/guards/sproochli-copy.mjs`. General idempotent host provisioning is
still to be packaged as Sproochli onboarding, so new hosts must not copy
Misebox-specific identifiers.

## External hosts

A future WordPress or non-Google adapter may use a signed installation
credential instead of Google OIDC. It must retain the same registration
boundary: one server-verifiable installation principal scoped to the declared
host and host-owned storage. The authentication adapter may differ; ownership
and authorization do not.

## Current authority

- Product and storage map: `docs/concepts/translation.md`
- Provider-family boundary: `docs/concepts/tool-provider.md`
- Host identity: `src/runtime/host.ts`
- Host persistence: `src/runtime/server/menu/`
- Provider client: `src/runtime/server/menu/provider-client.ts`
- Executable contract: `scripts/guards/sproochli-copy.mjs`
