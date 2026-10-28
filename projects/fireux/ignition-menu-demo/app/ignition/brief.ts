import type { IgnitionBrief } from 'fireux-ignite/runtime/models/ignition'

export const name = "Ignition Menu Demo"
export const brief: IgnitionBrief = {
  "id": "ignition-menu-demo",
  "industry": "Food service — read-only Menu starting App",
  "outcome": "Let guests browse the existing fictional Kitchen Menu in a normal FireUX App.",
  "actors": [
    "Guest"
  ],
  "requirements": [
    {
      "id": "browse-menu",
      "need": "Browse the existing fictional Kitchen Menu.",
      "acceptance": "The starting App renders the canonical Menu catalogue from Kitchen demo data without creating Orders."
    }
  ]
}
