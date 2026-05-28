# Go QR Solutions

Authority: Go QR primitive planning and provider boundaries  
Updated: 2026-05-28

Go QR owns QR primitives. Domain apps own domain workflows.

## text

Short message to QR page.

- Route: `/solutions/text`
- Public: `/text/{slug}`
- QR: `/text/{slug}/qr`
- Storage: Go QR

## doc

Public document to QR page.

- Route: `/solutions/doc`
- Public: `/doc/{slug}`
- QR: `/doc/{slug}/qr`
- Storage: Go QR

## url

Existing web link to QR code.

- Route: `/solutions/url`
- Storage: none by default

## phone

Phone number to call QR.

- Route: `/solutions/phone`
- Storage: none by default

## Planned primitives

- `pdf`
- `wifi`
- `whatsapp`
- `location`
- `vcard`
- `event`
- `review-link`
- `feedback-link`
- `booking-link`

## Ownership

- Food menus: Misebox
- Guest guides: BuenoHost
- Translation workflows: Sproochli
- QR mechanics: Go QR
