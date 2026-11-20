# Menu and Orders boundary

Updated: 2026-11-20
Ref: 330c4384f
Role: map, not canon

## Current boundary

Published Menus expose read-only catalogue items, prices, publication and
serving times. Menu and Kitchen ownership is mapped in the
[Menu family](family-menu.md#catalogue-and-order-dependency-direction).
The Menu route renderer uses `MenuDetail` for the public detail and
`MenuJson` for the diagnostic projection. Service-specific Kitchen entrances
share the read-only Menu catalogue. Public checkout, Kiosk and customer receipt
routes are removed.

Kitchen keeps its [staff Orders capability](order-processing-kitchen-fulfilment.md),
including the order editor, saved drafts, board, and protected status commands.
Previously saved orders are available to authorized staff. Services retains
Menu links and serving-hour configuration.

## Website menu delivery contract

Workspace Integrations composes the copyable website menu button. The button
opens the Kitchen's published Menu directory. The selected Kitchen controls
allowed embed origins independently of the public route. The demo host
exercises this browse entry and retains the direct link fallback.

## Verification and maintenance

Verify Menu browsing, publication, service catalogue and embedding separately
from staff draft and board behaviour. Start from the published Menu projection
before designing another customer ordering flow.
