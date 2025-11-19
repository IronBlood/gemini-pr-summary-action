import { defineConfig } from "tsdown"

export default defineConfig({
	entry: ["./src/index.ts"],
	platform: "node",
	noExternal: [
		"@actions/core",
		"@actions/github",
		"@google/genai",
	],
});
