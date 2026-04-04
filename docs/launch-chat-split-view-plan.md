# Launch Chat Split View Plan

## Goal

Add a page-level layout mode switch for the launch chat experience so users can choose between:

- `Unified`: the current single vertical workflow buffer
- `Split`: a two-pane layout with workflow/context on the left and the final launch package on the right

This should preserve the existing unified experience while giving users a more review-friendly workspace for longer runs.

## Confirmed Product Decisions

- layout preference should persist locally in `localStorage`
- split mode should be available on all laptop and desktop screen sizes
- `StartupBriefCard` should remain in the left panel in split mode

## Current Screen Structure

The current launch chat page is rendered in `src/features/launch-chat/launch-chat-screen.tsx` as a single centered column containing:

- `StartupBriefCard`
- `WorkflowTimeline`
- `LaunchPackagePreviewCard`
- `ResearchSourcesGrid`
- `RunArtifactsPanel`

Header actions are rendered through `src/features/launch-chat/components/launch-chat-header-actions.tsx`, which already owns the action cluster for `Restart` and `Approve`.

This makes the header actions area the correct place to add the new page-level layout toggle.

## Final Split Layout Model

### Unified Mode

Keep the current single-column vertical flow unchanged.

Order remains:

- `StartupBriefCard`
- `WorkflowTimeline`
- `LaunchPackagePreviewCard`
- `ResearchSourcesGrid`
- `RunArtifactsPanel`

### Split Mode

Render the page in two panes.

Left pane:

- `StartupBriefCard`
- `WorkflowTimeline`
- `ResearchSourcesGrid`
- `RunArtifactsPanel`

Right pane:

- `LaunchPackagePreviewCard`

This preserves the current information architecture while separating context and workflow support from the main final output.

## Layout Behavior

### Breakpoint Policy

Split mode should be available on all laptop and desktop screens.

Implementation recommendation:

- enable split mode at a large-enough desktop breakpoint such as `lg` or `xl`, depending on the actual visual fit during implementation
- below that breakpoint, automatically fall back to unified layout even if `split` is the saved preference

The saved preference should remain `split`, but the rendered layout should degrade gracefully when the viewport is too narrow.

### Pane Sizing

Recommended starting proportions:

- left pane: slightly narrower utility/context column
- right pane: wider reading/output column

Suggested grid balance:

- left: approximately `0.95fr`
- right: approximately `1.35fr`

This should be tuned visually during implementation, but the package pane should remain the dominant reading surface.

### Vertical Behavior

Recommended behavior:

- keep the existing sticky header
- below the header, split panes should occupy the remaining viewport height
- each pane should be independently scrollable

Why:

- the user can inspect timeline, sources, and artifacts without losing their place in the package
- the package remains visible while reviewing workflow evidence
- this matches the purpose of split mode better than a single page scroll

### Sticky Offset

The current header is fixed at `h-14`, so split layout sizing should account for that consistently.

Recommended available height pattern:

- pane container height based on `calc(100vh - 3.5rem)`

## Header Control

Add a page-level segmented control to `LaunchChatHeaderActions` with:

- `Unified`
- `Split`

Placement:

- inside the existing header action cluster
- before `Restart` and `Approve`

Behavior:

- clicking an option updates the page-level layout mode immediately
- active state is visually obvious
- this control is separate from the package card's internal `Designed` / `Raw text` toggle

Important distinction:

- `Unified / Split` controls page layout
- `Designed / Raw text` controls package content presentation

These should remain independent.

## Persistence Plan

Persist the layout mode in `localStorage`.

Recommended key:

- `launch-chat:view-mode`

Behavior:

- on initial client render, read the saved value
- if no saved value exists, default to `unified`
- on change, write the new value immediately
- if the saved value is `split` but the viewport is too narrow, render unified temporarily without overwriting the saved preference

Why local storage is the right choice:

- this is a personal UI preference
- it does not need backend storage initially
- it keeps the feature simple and fast

## Implementation Plan

### 1. Add page-level view mode state

In `LaunchChatScreen`:

- add a client-side `viewMode` state with `"unified" | "split"`
- hydrate it from `localStorage`
- persist it back to `localStorage` when changed

This state should live at the screen level because it controls overall page composition.

### 2. Extend `LaunchChatHeaderActions`

Update `LaunchChatHeaderActions` to accept:

- `viewMode`
- `onViewModeChange`

Render a segmented control using existing button primitives or a compact custom control consistent with the rest of the header UI.

### 3. Split the current screen into reusable content groups

Within `LaunchChatScreen`, organize the existing sections into two logical groups.

Left group:

- `StartupBriefCard`
- `WorkflowTimeline`
- `ResearchSourcesGrid`
- `RunArtifactsPanel`

Right group:

- `LaunchPackagePreviewCard`

This avoids duplicating component trees and makes the two layouts easier to maintain.

### 4. Build a responsive split layout shell

Add a small layout wrapper or inline page-level structure that:

- renders the current stacked layout for unified mode
- renders a two-column layout for split mode
- uses desktop-only split styling
- falls back cleanly to unified on smaller screens

Recommended shell responsibilities:

- grid columns
- pane sizing
- independent scroll containers
- sticky height calculations under the header

### 5. Keep unified mode visually unchanged

Unified mode should remain as close as possible to the current experience.

This reduces regression risk and makes the new feature strictly additive.

### 6. Tune split-mode spacing

Some components were designed for full-width stacked layout and may need minor spacing or density adjustments in split mode.

Likely candidates:

- `StartupBriefCard`
- `RunArtifactsPanel`
- `LaunchPackagePreviewCard`

The goal is not to redesign these sections, only to make them fit naturally in pane-based layout.

### 7. Validate package rendering in right pane

The final package already supports structured rendering and raw text rendering.

Need to validate in split mode:

- the structured package remains readable at the chosen width
- long content scrolls well inside the pane
- the package card does not rely on full-page flow assumptions

### 8. Validate long-content behavior in left pane

Need to confirm:

- timeline expansion still feels usable
- source grid remains readable in a narrower pane
- artifact expansions do not overwhelm the left column
- large JSON or markdown artifact content does not create awkward overflow

If needed, split mode can use slightly denser spacing or capped inner heights for especially long raw artifact content.

## Technical Considerations

### Single State, Two Independent Toggles

The page will now have two separate user controls:

- header-level `Unified / Split`
- package-level `Designed / Raw text`

These should remain fully independent in behavior and state.

### SSR and Local Storage

Because `localStorage` is client-only:

- initialize safely on the client
- avoid hydration mismatch by choosing a predictable default before the stored preference is read

Recommended approach:

- default initial render to unified
- update to split after client hydration if local preference says split and viewport supports it

### Scroll Experience

Independent pane scrolling is the intended split-mode behavior, but this must be tested carefully.

Need to verify:

- wheel and trackpad behavior feel natural
- keyboard scrolling is acceptable
- sticky header does not overlap pane content
- focus handling inside collapsibles and buttons remains predictable

## Risks

### 1. Nested scroll awkwardness

Two independently scrolling panes can feel heavy if heights are off or if content gets clipped.

Mitigation:

- use a simple, full-height pane model
- avoid unnecessary nested inner scroll regions beyond the pane itself

### 2. Left pane becoming too dense

The workflow stack may feel cramped when narrowed.

Mitigation:

- tune spacing lightly in split mode
- keep sections collapsible as they are now

### 3. Right pane not feeling dominant enough

If the package pane is too narrow, split mode will not improve readability.

Mitigation:

- bias the grid in favor of the package pane
- validate against realistic long packages

## Acceptance Criteria

The feature is complete when:

- the header shows `Unified` and `Split` controls
- unified mode preserves the current vertical layout
- split mode places `StartupBriefCard`, timeline, sources, and artifacts on the left
- split mode places the final package on the right
- the chosen layout mode persists in `localStorage`
- split mode is available on laptop and desktop-sized screens
- smaller screens gracefully render unified layout even if split is saved
- the package remains readable and the workflow pane remains usable

## Recommended Execution Order

1. add page-level `viewMode` state and `localStorage` persistence
2. extend `LaunchChatHeaderActions` with the `Unified / Split` control
3. refactor `LaunchChatScreen` into left-group and right-group content blocks
4. implement the split layout shell
5. add responsive fallback behavior for smaller screens
6. tune spacing and overflow in both panes
7. validate long-package and long-artifact runs

## Non-Goals

This feature should not include:

- package content redesign beyond layout adjustments already required by split view
- backend persistence of layout mode
- changes to run generation, artifacts, or data shape
- combining the page layout toggle with the package content toggle
