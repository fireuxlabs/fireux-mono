# Packages

- [Core](core/fireux-core/README.md) owns the product-neutral FireUX framework
  and shared Nuxt and Firebase mechanics.
- [Extensions](extensions/) own reusable domains and capabilities, including
  optional Workspace and the standard App bundle.
- [Ecosystems](ecosystem/) compose Extensions for a product family and own
  shared infrastructure bindings.

Dependencies point down. Core is independent of Extensions and Ecosystems.
Extensions may use Core and lower Extensions. Ecosystems may use both.
An App can install Core and Extensions directly. The standard
[App builder](extensions/fireux-app/src/config.ts) requires an Ecosystem binding.
