# FireUX Core Tasks — Checklist

We work **chunk by chunk**. No jobs/roles until core is green.

---

## Chunk 2 — Navigation Reliability + Escape Hatches

### Status (so far)
- ✅ Sign out reliability improved (canonical sign out + console guard)
- ✅ Console has a visible Home escape hatch (one click → `/`)
- ✅ Menu button wiring corrected (avoid duplicate burgers on mobile)
- ✅ Menu reliability validated (tests #1–#6 PASS)

### Definition of “PASS” (binary)
For every test below:
- **PASS** = opens on first click + navigates on first click
- **FAIL** = needs refresh / second click / only works after auth resolves

### Tests
1. **Menu reliability (fresh load)**
   - Fresh load → click menu (desktop)
   - Fresh load → click menu (mobile)
   - Logged out → menu opens + navigates
   - Logged in → menu opens + navigates

2. **No refresh ever required**
   - If any case requires refresh → record:
     - desktop or mobile
     - logged in or out
     - first load or after navigation

3. **Home escape hatch**
   - Visible from all `/console/**` pages
   - Works on desktop and mobile
   - One click → `/`

   Done:
   - Implemented Home button in console layout using `router.replace('/')`

4. **Escape hatch verification**
   - Click Home from console → arrives at `/`
   - Browser Back does not trap user in console

   To verify:
   - Confirm Home is visible on all `/console/**` pages
   - Confirm Back does not bounce back into console after clicking Home

5. **Re-test sign out after navigation changes**
   - Desktop sign out
   - Mobile sign out
   - Refresh after sign out

   Done:
   - Sign out now redirects deterministically (console → `/`, auth surfaces → `/auth`)

   To verify:
   - Sign in → navigate around console → sign out → refresh → still signed out

6. **Menu reliability after first route change (common failure)**
   - Fresh load → open menu → navigate once → open menu again → navigate again
   - Run on:
     - desktop (logged out + logged in)
     - mobile (logged out + logged in)

---

### Stop Condition (Chunk 2)
Do not proceed until:
- Menu works every time
- Home is always reachable
- No refresh required for navigation

### Plan (Chunk 2)
1. Run tests in #1 on fresh load
2. Record any failures for #2
3. Validate #3 is present on all console pages
4. Validate #4 back-button behavior
5. Re-run #5 sign out checks
6. Run #6 (after first route change)
7. Declare “Chunk 2 done” or report the failing number(s)

---

## Chunk 3 — Profile vs Settings (Platform Rule)

### Goal
Clear separation between:
- **Profile** = public identity (avatar, display name, handle, bio)
- **Settings** = private account controls (email, password, privacy, subscription)

### Tasks
1. Ensure navigation labels clearly separate **Profile** and **Settings**
2. Remove ambiguity where “name” can be edited in multiple places
3. Enforce “no silent failures” for any update action:
   - success confirmation OR visible error message

### Stop Condition (Chunk 3)
- A user always knows where to edit public identity vs account settings
- No profile/settings action fails silently

---

## Chunk 4 — Console Core Hygiene

### Tasks
1. Remove dev language from user-facing UI (e.g. “production mode”)
2. Fix greeting fallback:
   - If name exists → “Hello {name}”
   - Else → “Hello”
3. Replace dead buttons:
   - Working link OR disabled with “Coming soon”
4. Console must not assume profiles exist

### Stop Condition (Chunk 4)
- No dev messaging on end-user surfaces
- No dead clicks on console home

---

## Chunk 5 — Zero States → Meaningful Actions

### Tasks
1. Replace meaningless “0 stats” blocks with CTAs:
   - Browse X / Create X
2. Followers/products empty states must be actionable (not just “0”)
3. Any stat shown must answer: “what can I do next?”

### Stop Condition (Chunk 5)
- No “0 followers / 0 purchases / 0 favourites” shown without a next action

---

## Next Quick Wins (no help needed)
1. Run a focused menu reliability pass on FireUX
2. If menu needs refresh: locate the first broken click and fix root cause
3. Ensure mobile menu opens + navigates without refresh
4. Ensure desktop sidebar collapse/menu interactions work first-load
5. Declare Chunk 2 done only when tests #1–#6 pass
