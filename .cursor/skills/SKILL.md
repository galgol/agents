---
name: focused-code
description: >-
  Guides implementation with lean diffs, project-consistent style, and sound
  design without over-engineering. Use when writing or editing code, refactoring,
  implementing features, fixing bugs, or when the user asks for best practices,
  minimal changes, focused scope, or clean design.
---

# Focused, minimal implementation

## Goal

Deliver the smallest correct change that satisfies the request: good structure, readable style, and no extra scope.

## Before coding

1. **Restate the requirement** in one sentence so scope stays obvious.
2. **Prefer extending** existing types, helpers, and patterns over new parallel abstractions.
3. **Identify touch points** (files, public APIs, tests) and stop when those are satisfied.

## Implementation rules

- **Minimal diff**: Every line should justify itself against the stated task. No drive-by refactors, no unrelated formatting sweeps, no speculative features.
- Do not optimize beyond the stated requirement or inferred immediate necessity.
- **Single path**: Prefer one clear code path over many branches for hypothetical cases unless the user asked for them.
- **Match the codebase**: Naming, imports, error handling depth, comment density, and test style should look like the surrounding author wrote them.
- **Reuse**: Search for similar logic or components before adding new ones.

## Design (lightweight)

- Choose the **simplest structure** that stays correct when requirements grow slightly (one level of indirection, not premature frameworks).
- **Keep boundaries honest**: do not widen public APIs or shared types unless the task needs it.
- **UI/web**: align spacing, typography, and colors with existing patterns; polish only within the requested surface.

## Style

- Follow project linters/formatters; do not invent a second style.
- Prefer clarity over cleverness; avoid redundant variables and comments that restate the code.
- Do not delete unrelated comments or unrelated code while fixing something else.

## When unsure

- If a larger refactor seems necessary, **say so briefly** and either scope it to the request or ask whether to expand scope—do not silently broaden the task.

## Quick self-check (before finishing)

- [ ] Would removing any edited line break the task or readability?
- [ ] Could a reviewer see only this diff and understand why each part exists?
- [ ] Tests or manual verification cover the behavior that actually changed?
