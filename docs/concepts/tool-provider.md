# Tool provider family

Updated: 2026-07-22
Ref: 796952bf0
Role: map, not canon

## Purpose

Map how Go QR, Sproochli, Misebox, and future providers expose reusable tools
without taking ownership of a consumer's domain data. The map distinguishes the
shared transport from provider behavior and consumer meaning.

## Related maps

- Parent: `docs/concepts/server-api.md`
- App configuration: `docs/concepts/app-config.md`
- Tenant/global behavior: `docs/concepts/family-tenant-global.md`
- Menu consumer example: `docs/concepts/family-menu.md`
- AI provider boundary: `docs/concepts/ai-document-processing.md`

## Ownership rule

A provider owns reusable tool behavior. A consumer owns the data created for
that consumer.

Go QR can store a document when Go QR uses its own Doc tool. It must not store a
Misebox or tenant Kitchen document merely because it rendered the upload UI.
Dogfood changes the consumer identity; it does not create an ownership
exception.

| Layer | Owns |
| --- | --- |
| Core transport | Contract types, registry helper, CORS response helpers, iframe messaging, origin checks |
| Provider | Tool implementation, tool UI, accepted payload shape, provider route and result protocol |
| Consumer | Domain meaning, persistence endpoints, authorization, final public URL, post-result workflow |
| Dogfood app | The same consumer responsibilities when provider and consumer are the same app |

## Shared spine

1. The consumer chooses a provider and explicit tool id.
2. The consumer builds a small payload containing its copy, input policy,
   preview destination, and consumer-owned endpoints where the tool requires
   storage.
3. The FireUX tool loader posts that payload to
   `{providerOrigin}/api/tools/{toolId}`.
4. The provider validates and normalizes the payload, then returns a temporary
   provider tool URL.
5. The core iframe loads only that URL and validates message origin/source.
6. Authentication is sent to the iframe only through the explicit auth request
   handshake.
7. The provider tool calls the consumer-owned endpoint for consumer data.
8. A structured tool-result message returns control to the consumer.

The provider URL and the consumer's final public URL are separate concepts.

## Provider registry family

All provider registries use
`defineToolProviderRegistry()` from
`packages/core/fireux-core/src/runtime/server/utils/tool-provider.ts`.

| Provider | Current registry tools | Accepted delta |
| --- | --- | --- |
| Go QR | `doc`, `text`, `url` | Visual QR/document tools create temporary interactive tool sessions |
| Sproochli | `language-trigger`, `menu` | Translation tools expose translation-specific inputs and outputs |
| Misebox | `ordering` | Misebox can expose a product-specific integration tool |

Tool-specific contracts may differ. Registry shape, response headers, provider
identity, and transport behavior should not.

## Go QR Doc contract

The Doc provider deliberately has no consumer storage authority. Its POST
contract rejects payloads without both consumer endpoints:

- `endpoints.create`
- `endpoints.availability`

The payload may also describe copy, accepted file types, slug behavior, and the
consumer preview route. Those values configure the provider UI; they do not
transfer persistence ownership to Go QR.

Examples:

- Go QR dogfood supplies Go QR endpoints and stores a Go QR Doc.
- Misebox quick Menu supplies Misebox Menu endpoints and stores a root Menu
  source.
- Kitchen Workspace supplies the owning Kitchen App endpoints and stores a
  Kitchen-scoped upload.

## Environment policy

- Deployed consumers use the deployed provider.
- Local development defaults to the deployed provider unless the developer
  explicitly selects a local provider.
- The selected provider origin is configuration, not domain state.
- A consumer payload must not hardcode a finite list of tenant origins.
- Provider secrets never travel in the client payload.

## Current implementation evidence

- Contract types:
  `packages/core/fireux-core/src/runtime/types/tool-provider.types.ts`
- Server registry and headers:
  `packages/core/fireux-core/src/runtime/server/utils/tool-provider.ts`
- FireUX loader:
  `packages/core/fireux-core/src/runtime/composables/fireux/tool-provider/useToolProviderTool.ts`
- Iframe boundary:
  `packages/core/fireux-core/src/runtime/components/Provider/Tool/Iframe.vue`
- Go QR FireUX wrapper:
  `packages/extensions/fireux-go-qr/src/runtime/components/Provider/GoQr/Tools.vue`
- Go QR provider registry:
  `projects/fireux/go-qr/server/utils/goQrTools.ts`
- Go QR Doc payload contract:
  `projects/fireux/go-qr/server/utils/tools/doc.ts`
- Sproochli registry:
  `projects/fireux/sproochli/server/utils/sproochliTools.ts`
- Misebox registry:
  `projects/misebox/misebox-app/server/utils/miseboxTools.ts`

## Delta register

| Delta | Classification | Why | Alignment recommendation |
| --- | --- | --- | --- |
| Provider tools expose different input/output contracts | `accepted` | Their product jobs differ | Keep differences inside typed provider contracts |
| Dogfood stores data in the provider app | `accepted` | The provider app is also the consumer | Use the same consumer endpoint contract as external consumers |
| FireUX wrappers can add configured provider origin and dev mode labeling | `accepted` | FireUX runtime config is available to package consumers | Keep transport behavior in the core loader |
| Go QR app and `fireux-go-qr` each implement a near-identical wrapper | `migration` | Dogfood and package consumption need different origin defaults, not duplicate rendering logic | Extract one shared Go QR wrapper brain/presentation seam and pass only the origin policy delta |
| Go QR home and `/solutions/doc` duplicate the Doc payload | `drift` | Both are dogfood consumers of the same product configuration | Own the dogfood Doc payload once and consume it from both pages |
| Generic Go QR wrappers default the tool id to `doc` | `drift` | A switchboard wrapper should not silently choose a product | Require an explicit tool id at generic boundaries |
| Deployed Go QR fallback is repeated in module/component/app source | `migration` | The environment policy is valid but its value has multiple owners | Resolve the provider origin once in module/runtime configuration |
| Plain non-FireUX consumer ergonomics are not proven | `to-confirm` | Current loader injects FireUX context by default | Keep the HTTP contract framework-neutral; add a separate adapter only when a real external consumer exists |

## Alignment roadmap

### Now

1. Consolidate the two Go QR wrapper implementations around the core loader and
   iframe.
2. Centralize the Go QR dogfood Doc payload.
3. Require an explicit tool id and explicit meaningful payload at generic
   switchboard boundaries.
4. Add contract tests proving consumer endpoints remain mandatory for Doc.

### Next

1. Add provider-family tests for registry identity, CORS, iframe origin checks,
   auth handshake, and result messages.
2. Centralize deployed/local provider-origin policy without hardcoding tenant
   Apps.
3. Align Sproochli and Misebox wrappers only where their transport behavior is
   truly shared.

### Later

1. Publish a small framework-neutral consumer example when a real external
   consumer needs it.
2. Add versioning only when a provider contract must support incompatible
   released consumers.

## Guardrails

- Never let a provider become the accidental database for external consumers.
- Never import provider internals into a consumer.
- Never pass provider secrets through client payloads.
- Never trust iframe messages without origin, source, and frame checks.
- Never patch one consumer with tenant-specific origins.
- Never call duplicated wrappers alignment merely because their templates look
  similar; move shared behavior to one seam.
