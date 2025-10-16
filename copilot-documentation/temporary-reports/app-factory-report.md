**App Factory Report (revised)**

_Last updated: 2025-10-16_

---

## What changed (TL;DR)

- We are deprecating `useAppOnboarding()` and `useAppEnsure()`.
- We now rely on a minimal `useAppFactory()` composable that exposes:
  - `createApp(input?: CreateAppInput)` — builds the document shape only (no writes).
  - `canCreateSandbox()` — runtime guard to ensure sandboxes are created only from the global app shell.
- Sandbox documents returned by the factory are intentionally lightweight: no `app_short_name`, no `admin_ids`, no timestamps.
- Global and tenant documents mirror the 7-property shape already in use by Misebox and Niederhorn.

---

## Legacy entry points (to retire)

| File                                          | Purpose                                 | Status                 |
| --------------------------------------------- | --------------------------------------- | ---------------------- |
| `runtime/composables/app/useAppOnboarding.ts` | Ran env check and invoked `ensureApp()` | Swap to factory caller |
| `runtime/composables/app/useEnsureApp.ts`     | Created app doc and linked admins       | Retire after migration |

**Migration goal:** Callers now generate payloads via the factory and persist them explicitly using the Firestore manager or a server-side provisioning step.

---

## New entry point

**File:** `packages/core/fireux-core/src/runtime/composables/app/useAppFactory.ts`

```typescript
export type CreateAppInput = ['sandbox', string] | undefined

export function useAppFactory(/* _app?: Ref<AppDoc | null | undefined> */) {
  const { ecosystem, role, appId, appName, appShortName } = useFireUXConfig()
  if (!ecosystem)
    throw new Error('AppFactory: missing ecosystem in runtime config.')

  function createApp(input?: CreateAppInput): Partial<AppDoc> {
    const r = role as AppRole

    // Sandbox: only allowed from global shell; requires a name
    if (input) {
      if (r !== 'global')
        throw new Error('Sandbox creation is only allowed from the global app.')
      const [, sandboxName] = input
      if (!sandboxName)
        throw new Error('Sandbox requires a non-empty app name.')
      return {
        id: `sandbox-${Date.now()}`, // placeholder; L2 may slug/replace on write
        ecosystem,
        app_name: sandboxName,
        role: 'sandbox',
      }
    }

    // Runtime-driven (no override)
    if (r === 'global') {
      return {
        id: `${ecosystem}-app`,
        ecosystem,
        app_name: appName,
        ...(appShortName ? { app_short_name: appShortName } : {}),
        role: 'global',
      }
    }

    // Tenant
    return {
      id: appId || 'tenant-app',
      ecosystem,
      app_name: appName || 'Tenant App',
      ...(appShortName ? { app_short_name: appShortName } : {}),
      role: 'tenant',
    }
  }

  const canCreateSandbox = () => (role as AppRole) === 'global'

  return { createApp, canCreateSandbox }
}
```

### Behavior guardrails

- `createApp()` with no arguments respects the runtime role:
  - `global` → returns the `${ecosystem}-app` payload (matches Misebox hub shape).
  - `tenant` → returns the current tenant payload (matches Niederhorn shape).
- `createApp(['sandbox', name])`:
  - Only valid when the runtime role is `global`.
  - Returns the minimal sandbox document `{ id, ecosystem, app_name, role: 'sandbox' }`.
- No automatic `app_short_name`, `admin_ids`, or timestamp metadata for sandboxes; these are added in the subsequent persistence layer.

---

## Shapes (for reference)

**Fully fledged (7 properties)** — unchanged for Misebox (global) and Niederhorn (tenant):

```json
{
  "ecosystem": "misebox",
  "app_name": "Misebox",
  "app_short_name": "Misebox",
  "role": "global",
  "creator_id": "jMK33p5XlhYS8rBCEf8qUiogfMg2",
  "admin_ids": ["jMK33p5XlhYS8rBCEf8qUiogfMg2"],
  "id": "misebox-app"
}
```

```json
{
  "ecosystem": "misebox",
  "admin_ids": ["DcTtAdfyfkNBTDIzreoL0Oq6TYw2"],
  "app_name": "Niederhorn",
  "app_short_name": "Niederhorn",
  "role": "tenant",
  "id": "niederhorn",
  "creator_id": "DcTtAdfyfkNBTDIzreoL0Oq6TYw2"
}
```

**Sandbox (minimal)** — straight from the factory before persistence enrichment:

```json
{
  "id": "sandbox-{timestamp}",
  "ecosystem": "misebox",
  "app_name": "Bob’s Burger Joint",
  "role": "sandbox"
}
```

Any additional fields (timestamps, `creator_id`, `admin_ids`, etc.) must be added by the write flow (preferably in a server action).

---

## Wiring callers (now)

```ts
const { createApp, canCreateSandbox } = useAppFactory()

const payload = createApp() // global or tenant doc based on runtime

const sandbox = canCreateSandbox()
  ? createApp(['sandbox', 'Bob’s Burger Joint'])
  : null

if (sandbox) {
  const { setDocument } = useFirestoreManager()
  await setDocument('apps', sandbox.id!, sandbox, { raw: true })
}
```

**Post-create suggestions:**

- Add metadata such as `creator_id`, `admin_ids`, and timestamps in a dedicated provisioning helper (server action recommended).
- Handle uniqueness (e.g., tying to `place` records) in that provisioning layer.

---

## Deletion plan (after migration)

- Remove `useAppOnboarding.ts`.
- Remove `useAppEnsure.ts`.
- Update dev tooling pages and any components still referencing the legacy composables to call the factory plus your chosen write helper.

---

## Next (incremental) steps

1. **L2:** Introduce a `useAppProvisioning()` composable or Nitro route that validates uniqueness, persists the doc, conditionally assigns admins for global/tenant apps, and stamps metadata.
2. **L3:** Add optional place binding logic to prevent duplicate tenant names.
