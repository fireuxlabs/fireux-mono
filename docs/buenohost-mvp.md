# BuenoHost MVP

BuenoHost owns guest manual and short-stay host information.

It is separate from Sproochli:

- BuenoHost owns properties, guest guides, guide sections, host messages, and future host console editing.
- Sproochli owns translation services and translation cache for structured documents owned by other apps.
- Misebox owns kitchen/menu structure.

The first proof app lives at:

```text
projects/fireux/buenohost
```

Current proof routes:

```text
/
/bnb
/bnb/holiday-with-nats
/bnb/holiday-with-nats/:sectionId
```

## Product Shape

BuenoHost is information-first. A guide should answer the questions guests ask most often:

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

Hosts should later be able to enable, disable, and edit sections from a console.

## Data Canon

The current proof uses static app content:

```text
projects/fireux/buenohost/app/content/bnbGuides.ts
```

Nats has a seed script so the same content can live in the BuenoHost Firestore database:

```text
scripts/seed-buenohost-bnb-guides.mjs
```

The BuenoHost app database is:

```text
buenohost
```

Guest guide data should use:

```text
properties/{propertyId}
properties/{propertyId}/guest_guides/{guideId}
properties/{propertyId}/guest_guides/{guideId}/sections/{sectionId}
properties/{propertyId}/guest_messages/{messageId}
properties/{propertyId}/maintainers/{maintainerId}
```

Sproochli stores translations for these structured documents, but BuenoHost remains the source of truth for the host guide.

Every BuenoHost guide that can be translated should expose a stable translation reference:

```ts
{
  source_app: 'buenohost',
  document_type: 'bnb-guide',
  document_slug: 'holiday-with-nats',
  source_language: 'en'
}
```

The public guide can ask Sproochli for published translation availability:

```text
GET /api/public/translations/available?source_app=buenohost&document_type=bnb-guide&document_slug=holiday-with-nats
```

Important rule:

```text
Only published/reviewed translations are public.
Draft, planned, or missing translations must not be shown as available.
```
