# fireux-sharer

Sharer ecosystem package for FireUX.

This package defines Sharer branding, configuration, and ecosystem-specific wiring used by apps in the Sharer ecosystem.

See the [Sharer context](docs/ai/sharer-context.md) for App and package ownership.

## Structure

- src/ - authored source code (runtime + helpers)
- package.json - package identity, exports, dependencies and commands
- tsconfig.json - TypeScript config

## Notes

- Keep Level-1 strict and minimal
- Put implementation inside src/
- Do not commit build output
