# FireUX Jobs Extension

A shared extension for adding job posting, applications, and contracts across any FireUX-powered app (like Misebox or Cleanbox).

---

## Audience

App tenants and developers who need hiring or recruitment features within their platforms.

---

## Purpose

The Jobs Extension provides a reusable structure for listing positions, managing applicants, and processing temporary or long-term contracts.
It connects agents and professionals across the FireUX ecosystem and ensures consistent workflows between industries.

---

## Key Features

- Job posting forms with custom fields per tenant
- Application management and candidate tracking
- Contract generation and digital signing
- Rating system (star-based, like Uber) for temporary work
- Agent verification and profile linking
- Notifications for new applicants or job status updates
- Support for both internal and public job boards

---

## Main Pages / Routes

- `/jobs` – list of open positions
- `/jobs/[id]` – detailed job view
- `/agents/[id]/jobs` – manage agent postings
- `/applications` – view submitted applications
- `/contracts` – manage signed agreements

---

## Next Steps

- Implement multi-tenant filtering (e.g., Cleanbox jobs vs Misebox jobs)
- Add in-app chat between agent and applicant
- Integrate reference verification from Misebox
- Expand ratings system to include reliability and skill metrics
- Publish API endpoints for external job feeds

---

## Summary

The FireUX Jobs Extension turns any app into a hiring platform.
It connects professionals and agents directly within the ecosystem — reducing friction, duplication, and manual communication between industries.
