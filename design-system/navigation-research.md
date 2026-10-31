# Floating glass tab bar

Sources (2026-10-31):
- https://developer.apple.com/design/human-interface-guidelines/materials : Liquid Glass establishes a separate floating control/navigation layer above content.
- https://developer.apple.com/design/human-interface-guidelines/tab-bars : preserve predictable tab destinations and readable icon labels.

Application: CSS interpretation for the web prototype, not a native iOS implementation. One floating capsule, translucent light fill, backdrop blur, subtle reflective edge, teal selected indicator. Preserve four tab labels, routes, selection semantics and safe-area spacing. Shared height token reserves space in scroll content and pending consultation minibar. Reduced motion uses existing global rule; reduced transparency, unsupported backdrop filters and forced colors get explicit fallbacks. No auto-collapsing labels. Visual verification still requires built-in Browser connection.
