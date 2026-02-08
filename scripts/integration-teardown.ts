#!/usr/bin/env bun
/**
 * Stop Docker containers and remove volumes.
 * Usage: bun scripts/integration-teardown.ts
 */

async function main() {
	console.log("Stopping Docker containers...");
	const compose = Bun.spawn(
		["docker", "compose", "-f", "docker-compose.test.yml", "down", "-v", "--remove-orphans"],
		{ stdout: "inherit", stderr: "inherit" },
	);
	const exitCode = await compose.exited;
	if (exitCode !== 0) {
		console.error("docker compose down failed");
		process.exit(1);
	}
	console.log("Containers stopped and volumes removed.");
}

main();
