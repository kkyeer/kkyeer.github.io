# Archive Pages Home Language Design

## Context

The site homepage already has a clear visual language: soft layered background treatment, restrained brand gradients, and translucent card surfaces. The archive entry pages for categories, tags, and timeline currently function correctly, but they still read as plain list wrappers rather than part of the same visual system.

The goal of this change is to make `/categories/`, `/tags/`, and `/timeline/` feel like archive-specific homepages that belong to the same design family as `/`, without sacrificing archive readability or existing archive behavior.

## Goals

- Reuse the homepage background and translucent visual language on archive pages.
- Add a prominent archive hero area above the existing archive lists.
- Keep archive browsing dense and readable after the hero section.
- Preserve current archive behaviors:
  - tags page keeps in-page single-select filtering
  - categories and timeline keep anchor-style quick navigation
- Keep implementation centralized so archive behavior remains maintained in one component boundary.

## Non-Goals

- Rebuild the homepage or couple archive pages directly to homepage internals.
- Create three independent archive page components with duplicated behavior.
- Change archive grouping logic, tag filtering semantics, or post ordering.
- Turn archive pages into full landing pages that compete visually with post content.

## Options Considered

### Option 1: Visual polish only on current structure

Keep the current archive page structure and only add background, transparency, and lighter cards.

Pros:

- Lowest implementation cost
- Minimal structural risk

Cons:

- Archive pages still lack a clear top-level identity
- Does not really align archive pages with the homepage interaction rhythm

### Option 2: Shared archive hero shell above existing content

Keep one shared `ArchivePage.vue` component, add a homepage-language hero area at the top, and place archive-specific summary, quick navigation, and filter state in a translucent surface.

Pros:

- Best balance of visual consistency and archive usability
- Preserves existing grouping and filtering behavior
- Keeps implementation and maintenance centralized

Cons:

- Requires modest component restructuring
- Needs careful styling to avoid overpowering list content

### Option 3: Three fully custom archive page layouts

Give each archive page its own layout and page-specific structure.

Pros:

- Maximum visual flexibility

Cons:

- Duplicated behavior and styling logic
- Higher maintenance cost
- Easier to introduce behavioral drift across archive pages

## Chosen Direction

Use Option 2.

Archive pages will gain a shared archive hero shell that uses the same visual language as the homepage, but with a more restrained archive-first hierarchy. The hero will feel related to the homepage rather than copied from it.

## User Experience Design

### Shared page structure

Each archive page will render in this order:

1. Archive hero wrapper
2. Archive hero content
3. Archive translucent info panel
4. Existing archive navigation and grouped post lists

The hero wrapper provides the large background treatment. The translucent info panel carries the operational archive controls and summary information. The grouped lists remain the core browsing surface below.

### Shared visual language

Archive pages should reuse the homepage design language through:

- soft radial and linear gradient background layers
- the same typography rhythm used for prominent page titles
- translucent glass-like summary surfaces
- gentle border and shadow treatment for chips and post cards

They should not match the homepage one-to-one. Archive pages must remain calmer and more utility-focused than `/`.

### Page-specific content

#### Categories

The categories hero should emphasize topic-based exploration.

The info panel should prioritize:

- total category count
- total archived post count
- quick navigation to major categories

#### Tags

The tags hero should emphasize discovery and filtering.

The info panel should prioritize:

- total tag count
- current active tag state when filtered
- high-frequency tags as quick actions

The current active tag message should be integrated into the hero/info panel rather than remain a detached standalone strip.

#### Timeline

The timeline hero should emphasize time-based browsing.

The info panel should prioritize:

- year span represented in archive data
- total archived post count
- quick navigation to recent years

## Component Design

### Archive component boundary

`docs/.vitepress/theme/components/ArchivePage.vue` remains the single archive entry component for categories, tags, and timeline.

It will be extended to compute:

- page title
- page description
- archive summary metrics
- page-specific hero copy

This keeps archive grouping, tag filtering, and page-specific presentation in one controlled boundary.

### Styling boundary

Visual implementation should live primarily in `docs/.vitepress/theme/custom.css`.

That includes:

- archive hero background
- translucent summary panel
- chip, section, and card refinements
- responsive layout behavior

Markdown entry pages should remain minimal wrappers around `<ArchivePage type="..." />`.

## Behavior Requirements

- Tags page must continue using in-page toggle filtering rather than changing to anchor jumps.
- Categories and timeline must continue using anchor-based navigation.
- Existing grouped archive sections and post ordering must remain intact.
- If a tag filter produces no visible section, the existing empty-state behavior must remain available.

## Responsive Design

- The hero and translucent summary panel must collapse cleanly on small screens.
- Summary metrics and quick navigation chips must wrap without causing overflow.
- Mobile layout should preserve hierarchy: title first, summary second, list content third.
- Increased visual treatment must not significantly reduce scanability of the post list on mobile.

## Testing Strategy

Update archive structure tests so they continue to verify:

- `ArchivePage` still owns the three archive entry modes
- tags still use in-page filtering behavior
- categories and timeline still use grouped navigation behavior

Add assertions only for stable structural markers introduced by the new hero layer. Avoid overfitting tests to exact copy text or purely cosmetic class names when not necessary.

## Risks And Mitigations

### Risk: hero overwhelms archive content

Mitigation:

- keep hero copy concise
- keep the translucent panel compact
- use restrained spacing and contrast

### Risk: homepage coupling becomes fragile

Mitigation:

- reuse visual language through local archive styles, not through direct dependency on homepage component internals

### Risk: tag page behavior regresses while moving filter UI

Mitigation:

- preserve current query-sync and toggle logic
- update tests around tag filtering structure

## Implementation Notes

- Prefer computed configuration keyed by archive `type` instead of branching template markup repeatedly.
- Preserve the existing archive list markup where possible and layer the new hero above it.
- Use the homepage as the visual reference, not as an implementation dependency.

## Success Criteria

This design is successful when:

- categories, tags, and timeline visually read as part of the same family as the homepage
- users still understand immediately that these are archive browsing pages
- archive navigation and filtering work exactly as before
- the archive implementation remains centralized and maintainable
