# Launch Package Rendering Plan

## Goal

Improve the final package reading experience so it feels designed and scannable without turning the output into an over-fragmented dashboard or leaving it as a wall of plain text.

The target experience is a hybrid:

- editorial where the copy should feel persuasive and polished
- structured where the content is repetitive, list-based, or action-oriented
- always faithful to the original package text

## Current State

The final package is currently rendered primarily as markdown/text. That keeps implementation simple, but it creates a few UX problems:

- long outputs feel visually flat
- repeated bullets and paragraphs are hard to scan
- important sections like the headline, hook, and strategic angle do not get enough emphasis
- operational sections like next steps and channel plans do not feel action-oriented

At the same time, the output format is stable enough that we do not need to treat it as arbitrary freeform prose.

## Core Principle

Do not try to turn every sentence into a component.

Instead, use the stable section structure as a semantic scaffold, and render each section in a presentation style that matches its purpose.

That means:

- structure at the section level
- text at the sentence level
- visual variety without losing readability
- fidelity to the original wording

## Recommended Rendering Model

Use a semi-structured package renderer.

The renderer should:

- recognize the stable top-level sections in the package
- recognize a small set of stable subfields inside those sections
- map those sections to purpose-built UI blocks
- preserve the original text inside those blocks
- provide a raw text or markdown fallback view

This is intentionally narrower than a generic markdown parser and more useful than a plain prose renderer.

## Expected Stable Package Structure

The common output format includes:

- `Strategic Angle`
- `Launch Script`
- `Hook Options`
- `Research Signals`
- `Content Strategy`
- `Fundraising Angles`
- `Next Moves`

Known subfields that are worth recognizing explicitly:

- `Headline:`
- `Hook:`
- `CTA Options:`
- `Positioning:`
- `Campaign Moves`
- `Channel Plan`
- `Hook 1`, `Hook 2`, and so on

## Section-by-Section Rendering Plan

### Strategic Angle

Render this as a thesis or hero statement block.

Desired treatment:

- large, high-emphasis typography
- constrained width for readability
- subtle accent container or tonal background
- no extra fragmentation

Why:

This section is usually one strong argument, not a list. It should feel like the core thesis of the package.

### Launch Script

Render this as a composed narrative section rather than plain paragraphs.

Recommended breakdown:

- `Headline` as a prominent hero strip or title card
- `Hook` as a highlighted callout or quote block
- body bullets as a vertical narrative stack or numbered beats
- `CTA Options` as compact CTA cards, chips, or action tiles

Why:

This section mixes high-emphasis messaging with supporting copy. It benefits from hierarchy more than from raw markdown.

### Hook Options

Render each hook as its own card.

Recommended treatment:

- grid or stacked card layout depending on screen width
- clear `Hook 1`, `Hook 2`, etc.
- full original hook text preserved
- optional subtle visual ranking or recommendation treatment later if needed

Why:

Users naturally compare hooks side by side. Cards support quick scanning and make selection easier.

### Research Signals

Render signals as evidence tiles instead of bullets.

Recommended treatment:

- one signal per tile
- compact but readable layout
- stronger emphasis on the key insight or first clause
- optional secondary treatment for source/reference text later

Why:

This content is informational and repetitive in structure, which makes it ideal for a card or tile system.

### Content Strategy

Render this as a split section with distinct sub-areas.

Recommended treatment:

- `Positioning` as a highlighted summary block
- `Campaign Moves` as initiative cards or checklist rows
- `Channel Plan` as channel-specific rows or compact cards

Why:

This section blends strategic summary with execution planning. A mixed layout will make it easier to scan.

### Fundraising Angles

Render these as investor-facing argument cards.

Recommended treatment:

- one angle per card
- title inferred lightly from the leading phrase if helpful
- stronger emphasis on market timing, differentiation, or economics where present

Why:

These are discrete arguments, not a single flowing narrative.

### Next Moves

Render this as an action list or timeline.

Recommended treatment:

- numbered checklist or roadmap rows
- each move remains plain text
- optional due-date emphasis if date-like language is present

Why:

This section is operational. It should feel actionable rather than editorial.

## What Should Stay as Text

The goal is not to replace writing with UI chrome.

These should usually remain plain text inside components:

- strategic thesis paragraphs
- hook copy
- explanatory research statements
- nuanced positioning language

The UI should improve rhythm, emphasis, and scanability, not rewrite or atomize the substance.

## What Should Become Structure

These are the best candidates for componentization:

- stable top-level sections
- labeled fields like headline and hook
- repeated collections
- numbered hooks
- research signals
- campaign moves
- channel plans
- next-step action items

## Fallback and Trust Model

The product should not force users into only one representation.

Recommended UX:

- default to a designed or structured view
- provide a `Raw Text` or `Markdown` toggle
- optionally provide `Copy Markdown`

Why:

- users get a better default reading experience
- users can confirm the content was not altered by presentation
- fallback remains available if parsing misses anything

## Data Strategy Recommendation

Prefer rendering from structured package data where available, not from markdown parsing alone.

Reasons:

- more reliable than inferring meaning from text formatting
- less brittle when copy changes slightly
- easier to evolve visually over time
- better fit for the existing package shape

Markdown or raw text should remain a fallback and export representation.

## Parsing Strategy Recommendation

If parsing is needed, it should be lightweight and limited to known structure.

Do:

- parse only the stable section names
- parse only known labeled subfields
- preserve the original text payloads inside those parsed regions

Do not:

- attempt a fully generic markdown-to-components system for this experience
- infer semantics from arbitrary punctuation patterns
- overfit to minor formatting quirks

## UX Direction

Recommended default direction: hybrid.

That means:

- editorial treatment for `Strategic Angle`, `Headline`, and `Hook`
- structured treatment for `Research Signals`, `Content Strategy`, `Fundraising Angles`, and `Next Moves`

This balances polish with utility.

## Suggested Component Model

The eventual component model could look like:

- `LaunchPackageStructuredView`
- `PackageHero`
- `LaunchScriptPanel`
- `HookOptionsGrid`
- `ResearchSignalsGrid`
- `ContentStrategyPanel`
- `FundraisingAnglesGrid`
- `NextMovesTimeline`
- `RawPackageText`

These names are directional, not final.

## Recommended First Iteration

For a strong first pass, focus only on the main final package experience.

Phase 1:

- build a designed view for the final package
- keep the raw markdown or text fallback
- support the stable common format only

Phase 2:

- improve individual section treatments
- add richer evidence presentation
- optionally support fallback parsing for older text-only runs

Phase 3:

- extend the same rendering approach into artifact views where it adds value

## Things to Avoid

- cardifying every paragraph
- building a generic markdown visualizer as the primary experience
- heavy nested cards inside cards inside cards
- overusing badges, pills, and decorative labels with little semantic value
- making the layout feel more like a dashboard than a persuasive package

## Success Criteria

The redesign is successful if:

- users can scan the package faster
- the most important claims stand out immediately
- repeated list-like sections feel organized
- the writing still feels like the hero, not the UI
- users can still access the raw package text when they want to
