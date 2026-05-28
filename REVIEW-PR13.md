# Code Review — PR #13: "Update ebook headline and modern arcade theme"

**PR**: #13 (`cursor/modern-arcade-theme-c3b7` → `master`)
**Files changed**: 4 (`index.html`, `Layout.jsx`, `Layout.test.jsx`, `index.css`)
**Net diff**: +59 / −36 lines

---

## Top 3 Changes Needed

### 1. Hardcoded colors must be replaced with CSS custom properties

The PR defines CSS variables (`--c-surface`, `--c-surface-2`, `--c-accent-hover`) but then
bypasses them with inline hex and `rgba()` values throughout the stylesheet. At least
**15 raw color literals** appear in component rules instead of referencing the design tokens:

| Location | Hardcoded value | Should use |
|---|---|---|
| `a:hover` | `#9efbff` | new variable or `--c-accent-hover` |
| `.app-header .brand` | `#f8f2ff` | `--c-text` or new token |
| `.btn-link` | `#ffd46b` | new accent variable |
| `.btn-link:hover` | `#ffe49e` | new accent-hover variable |
| `.btn-primary` color | `#121931` | `--c-bg` or token |
| `.input` background | `rgba(10, 14, 35, 0.85)` | `--c-surface` or new token |
| `.app-header` background gradient | inline rgba stops | new `--c-header-bg` or similar |
| `.card` background gradient | inline rgba stops | `--c-surface` / `--c-surface-2` |
| `.btn` / `.btn:hover` backgrounds | inline gradient stops | tokens |
| `.btn-primary` / hover | three-color gradient stops | tokens |
| `.empty` background | inline gradient | token |
| `.media` background | inline gradient | token |
| `.avatar` background & glow | inline gradient + rgba | tokens |
| `body` background | three-layer gradient with raw colors | tokens |
| `.error` border/bg | inline rgba values | `--c-danger` derived tokens |

**Why it matters**: The purpose of `:root` variables is single-source theming. When half the
values are inline, changing the palette later forces a find-and-replace across every rule—
exactly the problem custom properties solve. The defined variables `--c-surface`,
`--c-surface-2`, and `--c-accent-hover` are effectively dead code since nothing references them.

---

### 2. Theme conflicts with project's Apple-like design guidelines

The project's UI skill (`.cursor/skills/ui/SKILL.md`) mandates an **Apple-inspired, minimal
design**: subtle shadows, neutral palette, restrained accents, whitespace over decoration, and
no decorative elements without functional purpose.

The new arcade theme directly contradicts these constraints:

- **Neon glow effects**: `text-shadow: 0 0 10px rgba(255,111,145,0.5)` on the brand,
  `box-shadow: 0 0 0 2px rgba(64,246,255,0.14)` on avatars.
- **Heavy shadows**: `--shadow-sm` went from `0 1px 2px` (subtle) to `0 8px 20px` (aggressive);
  `--shadow-md` from `0 4px 16px` to `0 18px 40px`.
- **Flashy multi-stop gradients**: `.btn-primary` uses a cyan→purple→pink gradient;
  the `body` stacks two `radial-gradient` layers plus a `linear-gradient`.
- **Hover transforms**: `.btn:hover` adds `translateY(-1px)` motion—decorative, not functional.
- **Warm accent outliers**: `#ffd46b` (gold) for `.btn-link` breaks the cool-neon palette
  and has no matching design token.

If the intent is to override the Apple guidelines with an arcade theme, the UI skill file
should be updated first so future work follows a consistent north star. Otherwise, the CSS
should be brought back in line with the existing design language.

---

### 3. Defined CSS variables are unused (dead tokens)

Several `:root` custom properties are declared but never consumed by any rule in the
stylesheet:

| Variable | Declared value | Used anywhere? |
|---|---|---|
| `--c-surface` | `#12193a` | No — cards, buttons, inputs, empty states all use inline gradients |
| `--c-surface-2` | `#1a2350` | No — media/avatar use inline gradients instead |
| `--c-accent-hover` | `#7f84ff` | No — button hovers use inline gradient stops |

These dead tokens increase cognitive overhead (a reader assumes they are meaningful) and
create a false promise of single-source theming. They should either be removed or, preferably,
actually referenced by the rules that currently inline the same (or similar) values.

---

## Additional Observations

- **Tests are adequate for the headline change**: `Layout.test.jsx` was correctly updated to
  match the new brand string. All 55 tests pass; lint is clean.
- **No visual regression coverage**: The massive CSS overhaul has no automated visual or
  snapshot test. If the project later adds visual regression tooling, this theme change would
  be the first candidate.
- **`backdrop-filter: blur(8px)`** on `.app-header` may cause performance issues on
  lower-end devices and has partial browser support—worth noting for accessibility.
