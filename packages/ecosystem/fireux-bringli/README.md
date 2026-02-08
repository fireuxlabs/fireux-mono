# fireux-bringli

Bringli ecosystem package for FireUX.

This package defines Bringli branding, configuration, and ecosystem-specific wiring used by apps in the Bringli ecosystem.

## Structure
- config/ - ecosystem configuration inputs
- src/ - authored source code (runtime + helpers)
- registry.json - ecosystem registry metadata
- tsconfig.json - TypeScript config

## Notes
- Keep Level-1 strict and minimal
- Put implementation inside src/
- Do not commit build output
