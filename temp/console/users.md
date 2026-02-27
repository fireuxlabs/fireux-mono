# Console User Profile (temp)

Scope: http://localhost:3000/console/user-profile

This doc is for the *user profile editing* experience.
We are parking this for now while we build the Overview first.

---

## 1) What this page should be responsible for

User-profile should cover:
- Editing identity fields (display name, avatar, handle, etc.)
- Editing bio/about
- Potentially managing user-level preferences

It should NOT try to become the console overview (no “cards”, no app lists).

---

## 2) Canonical user record

Primary Firestore doc:
- /users/{uid}

Relevant fields (high-level):
- id
- display_name
- avatar
- handle (optional)
- email (optional)
- bio (optional)
- created_at / updated_at

Membership mirrors (used elsewhere):
- userOf[] (apps the user belongs to)
- adminOf[] (apps the user admins)

Notifications (core):
- notifications[]

---

## 3) App overlay (not edited here)

Per-app membership overlay:
- /apps/{appId}/users/{uid}

Contains:
- role ('user' | 'admin')

This should generally be edited by admin flows, not user-profile.

---

## 4) Notes

We previously had a broader user model write-up in temp/user.md.
That file is now considered “source notes”, and this `temp/console/users.md` is the console-specific view.
