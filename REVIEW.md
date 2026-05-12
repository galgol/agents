# Code Review — Merge of `feature-new-flow` into `master`

**Commits reviewed:** `f076f23` ("new flow") + `4939b25` ("tests")
**Evaluated against:** `.cursor/skills/develop-base/SKILL.md`, `.cursor/skills/testing-base/SKILL.md`, `.cursor/skills/ui/SKILL.md`

---

## Top 3 Changes Needed

### 1. Remove the committed binary `app.db` and add it to `.gitignore`

The SQLite database file (`app.db`) is tracked in git and its binary diff appears in this push. A database file is environment-specific, changes on every run, causes meaningless merge conflicts, and can leak user data. It must be added to `.gitignore` and removed from tracking (`git rm --cached app.db`). This directly violates the **focused-code** skill ("every line should justify itself against the stated task") and the **pre-commit-test** skill ("no unintended side effects").

**Files to change:** `.gitignore`, plus `git rm --cached app.db`.

---

### 2. `_get_or_create_default_world` calls `db.commit()` mid-request — use `db.flush()` instead

In `backend/routers/characters.py` (line 27), the helper commits the new default world to the database *before* the character creation that follows. If character creation subsequently fails (e.g. validation error, database constraint), the "Real world" row is already persisted — an orphan side-effect the user never asked for. The fix is to replace `db.commit()` with `db.flush()` so the world gets an `id` without a separate transaction; the single `db.commit()` at the end of `create_character` will atomically persist both the world and the character. This aligns with the **pre-commit-test** skill's requirement to "identify potential regressions" and "ensure no unintended side effects," and with the **focused-code** skill's "single path" and minimal-risk principle.

```python
# In _get_or_create_default_world — change:
db.commit()
db.refresh(world)
# To:
db.flush()
```

---

### 3. Replace inline styles with CSS classes in `Library.jsx` (and `CharacterCard.jsx`)

Multiple inline `style={{…}}` objects were added in the Library page and CharacterCard:

- `Library.jsx` line 56: `style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}`
- `Library.jsx` line 83: `style={{ gap: '2rem' }}`
- `Library.jsx` lines 85, 100: `style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}`
- `CharacterCard.jsx`: `style={{ margin: 0 }}`

The existing codebase uses utility CSS classes (`stack`, `stack-tight`, `row`, `spread`, `muted`, `small`, etc.) and avoids inline styles. Adding ad-hoc inline styles violates all three skills:
- **UI skill:** "Reuse existing design system components whenever possible… maintain consistent spacing scale… avoid duplication of UI logic or styles."
- **Focused-code skill:** "Match the codebase — naming, imports, error handling depth, comment density, and test style should look like the surrounding author wrote them."
- **Pre-commit-test skill:** "Verify consistency with existing architecture and patterns."

These should be extracted into CSS classes that follow the project's existing spacing/typography system.

---

## Additional Observations (lower priority)

| # | Issue | Skill violated | Detail |
|---|-------|---------------|--------|
| 4 | CI workflows (`e2e.yml`, `frontend.yml`, `manual.yml`) had branch filters removed — now run on every push to any branch | focused-code (scope control) | This infra change is unrelated to the "new flow" feature and will increase CI cost/noise. |
| 5 | No migration path for new `Character` columns | pre-commit-test (regression) | `Base.metadata.create_all()` only creates missing *tables*, not missing *columns*. Existing databases will fail with "no such column" errors on the 7 new fields. A migration step or `ALTER TABLE` fallback is needed. |
| 6 | Missing edge-case tests for new appearance fields | pre-commit-test (edge cases) | No tests for max-length violations on `gender`/`hair`/`eyes`/`height`/`body_figure` (64–200 chars), boundary value `age=200`, or idempotency of `_get_or_create_default_world` (calling it twice for the same user). |
| 7 | `CharacterForm.jsx` displays 7 new fields in a flat list | UI (visual clutter) | The Apple-design skill says "avoid unnecessary UI elements or visual noise" and "use clear hierarchy." Grouping the appearance fields (e.g. in a collapsible section or visual fieldset) would improve scannability. |
