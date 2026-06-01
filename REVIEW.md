# Code Review — PR #23: Update header home icon and alignment

**Commit reviewed:** `ac807b1` (merged via `9351c45`)
**Files changed:** `Layout.jsx`, `Layout.test.jsx`, `home-icon-issue-22.jpg` (new asset)

---

## Summary of Changes

1. Replaced the SVG home icon (`comic-book-home.svg`) with a JPEG image (`home-icon-issue-22.jpg`).
2. Moved the `.brand` link ("The new Ebook era") from **before** `<nav>` to **after** `<nav>` inside the header, changing the visual order.
3. Updated the test to match the new alt text and assert the new DOM order (nav before brand).

---

## Top 3 Changes Needed

### 1. Dead Asset — Remove the now-unused `comic-book-home.svg`

The old icon file `frontend/src/assets/comic-book-home.svg` is no longer imported anywhere in the codebase. Per the **focused-code skill** ("Dead code, unused imports, or partially used abstractions are strictly forbidden") and the **core rules** ("Dead code, unused imports, or partially used abstractions are strictly forbidden"), this file should be deleted to keep the repository clean.

**Action:** Delete `frontend/src/assets/comic-book-home.svg`.

### 2. Asset Naming — Rename the issue-tracking filename to a semantic name

The new asset is named `home-icon-issue-22.jpg`, which embeds a GitHub issue number into a production source file. Per the **focused-code skill** ("Match the codebase: Naming, imports, error handling depth, comment density, and test style should look like the surrounding author wrote them") and the **UI skill** ("Maintain consistent spacing scale across all components" / consistent naming), asset names should be descriptive of their content, not their origin. The existing assets use semantic names (`hero.png`, `comic-book-home.svg`).

**Action:** Rename to something like `home-icon.jpg` or `home-icon-custom.jpg` and update the import in `Layout.jsx`.

### 3. Image Format — JPEG is suboptimal for a small icon; prefer SVG or optimized PNG

The new icon is a 38 KB JPEG at 980×980 px, but it renders at 28×28 CSS pixels (inside a 42×42 container). Per the **UI skill** ("Prefer native-feeling UI patterns" / "simplicity over visual complexity") and general performance best practices:
- JPEG is lossy and does not support transparency, which limits composability against varied backgrounds.
- A 980 px raster for a 28 px display slot is ~35× oversized; even at 3× retina this only needs ~84 px.
- The previous icon was an SVG (855 bytes) — infinitely scalable and 45× smaller.

**Action:** Provide an SVG or a properly-sized, optimized PNG/WebP. If a raster is required, resize to ~84×84 px and compress, or convert to WebP for better quality-to-size ratio.

---

## Additional Observations (minor, not in top 3)

- **Alt text is generic:** `"Custom home icon"` is less descriptive than the previous `"Comic book home icon"`. Consider an alt text that describes what the icon depicts.
- **Test uses `compareDocumentPosition`:** While technically correct, this DOM API is uncommon in UI tests. The existing test style uses simpler queries (`getByRole`, `getByText`). A comment explaining *why* DOM position is asserted would help future readers.
- **No CSS changes for JPEG rendering:** The `.home-link__icon` class has no `border-radius` or `object-fit` rule. If the JPEG has a non-transparent background, it may look different from the previous SVG inside the rounded `.home-link` container. Verify visually.
