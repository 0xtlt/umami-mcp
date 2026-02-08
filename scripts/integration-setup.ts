#!/usr/bin/env bun
/**
 * Start Docker containers, wait for Umami health, verify auth.
 * Usage: bun scripts/integration-setup.ts
 */

const UMAMI_URL = process.env.UMAMI_TEST_URL ?? "http://localhost:3099";
const MAX_WAIT_MS = 120_000;
const POLL_INTERVAL_MS = 2_000;

async function main() {
	console.log("Starting Docker containers...");
	const compose = Bun.spawn(
		["docker", "compose", "-f", "docker-compose.test.yml", "up", "-d"],
		{ stdout: "inherit", stderr: "inherit" },
	);
	const exitCode = await compose.exited;
	if (exitCode !== 0) {
		console.error("docker compose up failed");
		process.exit(1);
	}

	console.log(`Waiting for Umami at ${UMAMI_URL}/api/heartbeat ...`);
	const deadline = Date.now() + MAX_WAIT_MS;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(`${UMAMI_URL}/api/heartbeat`);
			if (res.ok) {
				console.log("Umami is healthy!");

				const authRes = await fetch(`${UMAMI_URL}/api/auth/login`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ username: "admin", password: "umami" }),
				});
				if (authRes.ok) {
					console.log("Auth verified. Integration environment ready.");
					process.exit(0);
				}
				console.log("Auth not ready yet, retrying...");
			}
		} catch {
			// Container not ready yet
		}
		await Bun.sleep(POLL_INTERVAL_MS);
	}

	console.error(`Timed out waiting for Umami after ${MAX_WAIT_MS / 1000}s`);
	process.exit(1);
}

main();
