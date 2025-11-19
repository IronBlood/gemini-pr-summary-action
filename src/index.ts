import * as core from "@actions/core";
import * as github from "@actions/github";
import { GoogleGenAI } from "@google/genai";

async function run() {
	try {
		const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			// fail early
			core.setFailed("GEMINI_API_KEY or GOOGLE_API_KEY must be set in the environment");
			return;
		}

		const token = core.getInput("github_token", { required: true });
		const octokit = github.getOctokit(token);
		const pr = github.context.payload.pull_request;

		if (!pr) {
			core.setFailed("This action must be run on a pull_request event");
			return;
		}

		const issue_number = pr.number;
		const { owner, repo } = github.context.repo;

		const files = await octokit.rest.pulls.listFiles({
			owner,
			repo,
			pull_number: issue_number,
			per_page: 100,
		});

		const arr: string[] = [];

		for (const file of files.data) {
			arr.push(`File: ${file.filename}\nStatus: ${file.status}\n${file.patch ?? ""}\n`);
		}

		let diffText = arr.join("\n");
		const MAX_CHARS = 8000;
		if (diffText.length > MAX_CHARS) {
			diffText = diffText.slice(0, MAX_CHARS) + "\n\n... (truncated)";
		}

		const contents = [
			"Summarize the following pull request changes for a reviewer. Highlight key changes, risks, and tests.",
			"",
			diffText || "(no patch data available)",
		].join("\n");

		const ai = new GoogleGenAI({ apiKey });
		const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
		core.info(`Using gemini model: ${model}`);
		core.info(`Sending diff for PR to Gemini: #${issue_number}`);
		const response = await ai.models.generateContent({
			model,
			contents,
		});

		await octokit.rest.issues.createComment({
			owner,
			repo,
			issue_number,
			body: response.text ?? "(Gemini returned no text)",
		});

		core.info(`Commented on PR ${issue_number}`);
	} catch (err) {
		core.setFailed((err as Error).message);
	}
}

run();
