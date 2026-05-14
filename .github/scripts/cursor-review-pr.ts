import { Agent } from "@cursor/sdk";
import { execFileSync } from "node:child_process";

// @cursor/sdk can attach multiple abort listeners in one run; Node warns spuriously in short CI jobs.
process.on("warning", (w) => {
  if (w.name === "MaxListenersExceededWarning") return;
  console.warn(w);
});

const MAX_DIFF_CHARS = 200_000;

function git(args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function getDiffRange(): { base: string; head: string } {
  const base = process.env.PR_BASE_SHA?.trim();
  const head = process.env.PR_HEAD_SHA?.trim();
  if (base && head) return { base, head };
  return { base: "HEAD~1", head: "HEAD" };
}

function main() {
  const { base, head } = getDiffRange();
  const files = git(["diff", "--name-only", `${base}...${head}`]).trim();
  let diff = git(["diff", `${base}...${head}`]);
  let truncated = false;
  if (diff.length > MAX_DIFF_CHARS) {
    diff = diff.slice(0, MAX_DIFF_CHARS);
    truncated = true;
  }

  const modelId =
    process.env.CURSOR_REVIEW_MODEL?.trim() ||
    "claude-4.6-sonnet-medium-thinking";

  const prompt = `You are reviewing a pull request in a checked-out repo (cwd is the full tree). The agent can read any file under cwd.

## Project standards (read these files if needed, then judge the PR against them)
- .cursor/rules/core-rules.mdc — stability, layers, scope, consistency
- AGENTS.md — repo layout and conventions
- .cursor/skills/SKILL.md — minimal diff, match existing style
- .cursor/skills/develop-base/SKILL.md — frontend/UI consistency (when JS/TS/CSS in PR)

## Changed paths
${files || "(none)"}

## Unified diff (${base}...${head})${truncated ? " [TRUNCATED — prioritize visible hunks; note if full review needs smaller PR]" : ""}
\`\`\`diff
${diff || "(empty diff)"}
\`\`\`

## Your task
1. Infer coding style from **nearby existing files** in the same directories/modules as the changes (imports, naming, error handling, layering), not from generic advice.
2. Flag only **concrete** problems: wrong layer, API/behavior risk, style drift vs this repo, missing tests when behavior changes, lint/format inconsistency with surrounding code.
3. If the diff is fine, say so briefly.

## Output (STRICT — print exactly this structure, no title, no preamble, no code fences, keep under ~35 lines total)
VERDICT: PASS | WARN | FAIL
SUMMARY: one sentence.

FINDINGS (max 6 lines; use \`path:line\` when possible; omit section if none):
- [blocker|major|minor] ...

STYLE: one sentence on whether the PR matches repo patterns.

END
`;

  return Agent.prompt(prompt, {
    apiKey: process.env.CURSOR_API_KEY!,
    model: { id: modelId },
    local: { cwd: process.cwd() },
  });
}

main()
  .then((result) => {
    if (result.status === "error") {
      process.stderr.write("cursor review failed\n");
      process.exit(2);
    }
    process.stdout.write(String(result.result ?? "").trimEnd());
    process.stdout.write("\n");
  })
  .catch((err) => {
    process.stderr.write(String(err));
    process.stderr.write("\n");
    process.exit(1);
  });
