# BuenoHost MVP
Authority: Tier1 (Authoritative)
Updated: 2026-05-16

BuenoHost owns guest manual and short-stay host information.

It is separate from Sproochli, Misebox, and Granite:

- BuenoHost owns properties, public property info, host messages, and future host editing.
- Sproochli owns translation services and translation cache for structured documents owned by other apps.
- Misebox owns kitchen/menu structure.
- Granite owns portfolio management. BuenoHost properties may later be compatible with Granite portfolios, but BuenoHost is not a portfolio management tool.

The first proof app lives at:

```text
projects/fireux/buenohost
```

Current proof routes:

```text
/
/properties/{propertySlug}
/properties/{propertySlug}/info
/properties/{propertySlug}/info/{infoId}
/console/property
/console/property/overview
/console/property/qr
```

## Product Shape

BuenoHost is information-first. Public property info should answer the questions guests ask most often:

- Emergency
- Wi-Fi
- Check-in and keys
- Checkout
- House rules
- Quiet hours
- Heating and cooling
- Kitchen and appliances
- Parking
- Rubbish and recycling
- Local shops
- Transport
- Useful contacts

Hosts should later be able to enable, disable, and edit property info from host tools.

The current Property console scaffold is route-shape only. It exists so the
child areas can be compared against Kitchen before data/write behavior is
wired. `/console/property` and `/console/property/overview` follow the
shared core console entry/overview shape. Property-owned child routes should be
added only when their canon is explicit; the current child route is QR.

Kitchen-shaped rule:

```text
Kitchen -> published route child menus/dishes
Property -> published route child info/topics
```

Do not add a separate `guest guide` product bucket. The property owns its public info directly.

## Data Canon

The current proof uses app-local demo data:

```text
projects/fireux/buenohost/app/demo/propertyInfo.ts
```

Nats has a seed script that should be renamed when the data migration is done:

```text
scripts/seed-buenohost-guest-guides.mjs
```

The BuenoHost app database is:

```text
buenohost
```

BuenoHost property data should use:

```text
properties/{propertyId}
properties/{propertyId}/info/{infoId}
properties/{propertyId}/messages/{messageId}
properties/{propertyId}/maintainers/{maintainerId}
```

Sproochli stores translations for these structured documents, but BuenoHost remains the source of truth for the property info.

Every BuenoHost property info topic set that can be translated should expose a stable translation reference:

```ts
{
  source_app: 'buenohost',
  document_type: 'property-info',
  document_slug: 'holiday-with-nats',
  source_language: 'en'
}
```

The public property info can ask Sproochli for published translation availability:

```text
GET /api/public/translations/available?source_app=buenohost&document_type=property-info&document_slug=holiday-with-nats
```

Important rule:

```text
Only published/reviewed translations are public.
Draft, planned, or missing translations must not be shown as available.
```
