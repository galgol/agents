import { Agent } from "@cursor/sdk";

const prompt = `Code review the changes in the latest commit based on the rules in
.cursor/skills/SKILL.md and summarize the main 3 changes needed.`;

const result = await Agent.prompt(prompt, {
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: "composer-2" }, // see note below about your model choice
  local: { cwd: process.cwd() },
});

console.log("status:", result.status);
console.log(result.result);
if (result.status === "error") process.exit(2);