import { Agent } from "@cursor/sdk";

const prompt = `Code review the changes in the latest commit based on the rules in
.cursor/skills/SKILL.md and summarize the main 3 changes needed.`;

async function main() {
  const result = await Agent.prompt(prompt, {
    apiKey: process.env.CURSOR_API_KEY!,
    model: { id: "claude-4.6-sonnet-medium-thinking" },
    local: { cwd: process.cwd() },
  });

  console.log("status:", result.status);
  console.log(result.result);
  if (result.status === "error") process.exit(2);
}

main();