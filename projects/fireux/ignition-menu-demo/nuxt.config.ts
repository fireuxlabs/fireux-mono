import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  "ecosystem": "fireux",
  "projectId": "fireux",
  "ecosystemId": "fireux",
  "id": "ignition-menu-demo",
  "name": "Ignition Menu Demo",
  "shortName": "Ignition Menu Demo",
  "role": "tenant",
  "selfJoinEnabled": false,
  "context": "TEST PREVIEW. Let guests browse the existing fictional Kitchen Menu in a normal FireUX App. This bounded assisted App uses read-only Kitchen demo data; it does not accept orders or claim general industry generation.",
  "modules": [
    "fireux-kitchens"
  ],
  "extends": [
    "fireux-fireux/layer",
    "fireux-blogs/layer",
    "fireux-kitchens/layer"
  ],
  "seo": {
    "siteUrl": "http://localhost:3048",
    "noindexPaths": [
      "/",
      "/**"
    ],
    "disallowPaths": [
      "/"
    ]
  }
})
