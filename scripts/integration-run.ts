#!/usr/bin/env bun
/**
 * Run integration test files sequentially (bun test runs in parallel by default).
 * Usage: bun scripts/integration-run.ts
 */

const files = [
	"01-auth",
	"02-websites",
	"03-events-seed",
	"04-stats",
	"05-sessions",
	"06-events-read",
	"07-users",
	"08-teams",
	"09-reports",
	"11-realtime",
	"12-cleanup",
];

let failed = false;

for (const file of files) {
	const path = `src/__integration__/${file}.integration.test.ts`;
	console.log(`\n--- Running ${file} ---`);
	const proc = Bun.spawn(["bun", "test", "--timeout", "30000", path], {
		stdout: "inherit",
		stderr: "inherit",
		cwd: import.meta.dir.replace("/scripts", ""),
	});
	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		console.error(`FAILED: ${file}`);
		failed = true;
		break;
	}
}

if (failed) {
	process.exit(1);
}

console.log("\nAll integration tests passed!");
