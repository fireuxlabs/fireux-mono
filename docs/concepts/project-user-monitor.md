# Project user monitor

Updated: 2026-07-24
Role: map, not canon

## Purpose

Map the minimal cross-App signup feed shown in the FireUX Project Console.

## Authority

- Each source App owns its canonical `app.user.joined` event under
  `apps/{appId}/events/{eventId}`.
- FireUX stores a bounded, minimal control-plane projection in the
  deny-all-client `platform-directory` database's
  `project-user-monitor/current` document.
- The projection contains only source Firebase project/database, canonical
  Project/Ecosystem/App ids, User id, membership role, and occurrence time.
- Returning authentication sessions are not signup events.

## Transport

- Source SSR runtimes publish over HTTPS with a fixed-audience Google OIDC
  identity token.
- The FireUX receiver validates a strict v1 payload and an exact
  service-account source scope before creating a deterministic record.
- Duplicate deliveries are successful no-ops. The receiver updates only the
  fixed current-feed document and retains the latest 200 joins; immutable
  history stays in each source App.
- Later account sessions may retry a previously published local event; the
  deterministic receiver identity keeps that retry from becoming new activity.
- Delivery failure never rolls back the source App membership, local event, or
  owner notification.

## Read boundary

- `/console/project/users` is the all-Project monitoring surface.
- Its browser calls only the FireUX admin API.
- The API requires current FireUX App-admin membership and returns at most 200
  allowlisted rows.
- The browser never reads tenant databases or the central Firestore collection
  directly.

## Configuration

Source runtimes require:

- `FIREUX_SIGNUP_MONITOR_ENDPOINT`
- `FIREUX_SIGNUP_MONITOR_OIDC_AUDIENCE`

The FireUX receiver requires:

- `FIREUX_SIGNUP_MONITOR_RECEIVER_ENABLED=true`
- `FIREUX_SIGNUP_MONITOR_OIDC_AUDIENCE`
- `FIREUX_SIGNUP_MONITOR_SOURCE_SCOPES`, a JSON array of exact service-account,
  Firebase project/database, canonical Project/Ecosystem, and App-id scopes.

## Delta register

| Difference                                      | State      | Reason                                                                                                                |
| ----------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| Source Apps retain full local membership events | `accepted` | Membership truth and retry authority remain with the owning App                                                       |
| FireUX stores only a bounded 200-row projection | `accepted` | Cross-project monitoring does not need profiles, email addresses, private membership payloads, or collection-list IAM |
| Delivery is best-effort after local commit      | `accepted` | Control-plane availability must not block signup                                                                      |
