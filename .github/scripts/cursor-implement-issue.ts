import { Agent, CursorAgentError } from "@cursor/sdk";

const {
  CURSOR_API_KEY,
  ISSUE_NUMBER,
  ISSUE_TITLE,
  ISSUE_BODY,
  REPO_URL,
  DEFAULT_BRANCH,
} = process.env;

const prompt = `Implement the feature requested in GitHub issue #${ISSUE_NUMBER}.

Title: ${ISSUE_TITLE}

Description:
${ISSUE_BODY?.trim() || "(no description provided)"}

Requirements:
- Follow the project rules in .cursor/rules and AGENTS.md.
- Make the smallest change that satisfies the request; do not refactor unrelated code.
- Add or update tests as appropriate (backend: pytest, frontend: lint/e2e).
- The PR description should reference "Closes #${ISSUE_NUMBER}".`;

async function main() {
  try {
    const result = await Agent.prompt(prompt, {
      apiKey: CURSOR_API_KEY!,
      model: { id: "gpt-5.3-codex" },
      cloud: {
        repos: [{ url: REPO_URL!, startingRef: DEFAULT_BRANCH ?? "main" }],
        autoCreatePR: true,
        skipReviewerRequest: true,
      },
    });

    console.log("status:", result.status);
    console.log(result.result);
    if (result.status === "error") process.exit(2);
  } catch (err) {
    if (err instanceof CursorAgentError) {
      console.error(
        `startup failed: ${err.message} retryable=${err.isRetryable}`,
      );
      process.exit(1);
    }
    throw err;
  }
}

main();
