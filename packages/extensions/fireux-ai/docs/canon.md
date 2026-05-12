# fireux-ai Canon
Authority: Tier1 (Package canon)
Updated: 2026-05-12

## 1) Purpose
- Own the shared server-only AI integration seam for FireUX packages and apps.
- Provide typed AI request/response contracts, provider config resolution, task whitelisting, and server utility calls for `generateText()` and `generateJson()`.

## 2) Runtime Config
- Server runtime config lives under `runtimeConfig.fireuxAi`.
- Public runtime config may expose only non-secret state under `runtimeConfig.public.fireux.ai`.
- Supported env/runtime knobs:
  - `FIREUX_AI_ENABLED`
  - `FIREUX_AI_PROVIDER`
  - `FIREUX_AI_API_KEY`
  - `FIREUX_AI_MODEL`
  - `FIREUX_AI_MODE`
  - `FIREUX_AI_SERVICE_KEY`
  - `FIREUX_INTERNAL_API_KEY`

## 3) Modes
- `disabled`: AI is unavailable.
- `dev`: AI may run only in local `import.meta.dev`.
- `app`: AI may run outside dev only through a configured service-key guard.

Default module state is disabled. Enabling AI must be explicit.

## 4) Internal Route Security
- `/api/internal/ai/generate` is token-spend capable and must fail closed.
- The route must reject requests before any provider call when AI is disabled, mode is invalid for the environment, or `FIREUX_AI_API_KEY` is missing.
- In `app` mode, requests must provide a matching service key via `x-fireux-ai-service-key`, `x-fireux-internal-key`, or `Authorization: Bearer <key>`.
- Service keys must remain server-only.

## 5) Package vs App Responsibility
- Package owns shared AI types, task whitelist, server adapter utilities, runtime config wiring, and internal route guard behavior.
- Apps decide whether to enable the module, which model/provider to use, and which server-side workflows may call the internal route.
- Apps must not expose provider keys, service keys, or unrestricted AI calls to public/client code.

## 6) Non-Goals
- Not a public chat API.
- Not a broad agent framework.
- Not a client-side AI SDK.
- Not an authorization framework for all FireUX server routes.

## 7) Future / Not Canon Yet
- Durable rate limiting, per-user permission checks, tenant billing policy, and usage persistence are not canon yet.
- Additional providers beyond the implemented adapter shape must update this canon before becoming production authority.
