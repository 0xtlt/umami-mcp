import { describe, test } from "bun:test";
import { UmamiApiError } from "../lib/errors";
import { createTestClient, readState, resetState } from "./setup";

const client = createTestClient();

async function safeDelete(fn: () => Promise<unknown>, label: string): Promise<void> {
	try {
		await fn();
	} catch (error) {
		if (error instanceof UmamiApiError && error.statusCode === 404) {
			console.log(`[cleanup] ${label} already deleted (404)`);
			return;
		}
		throw error;
	}
}

describe("12 - Cleanup", () => {
	test("delete report", async () => {
		const { reportId } = readState();
		if (reportId) {
			await safeDelete(() => client.deleteReport(reportId), "report");
		}
	});

	test("delete team", async () => {
		const { teamId } = readState();
		if (teamId) {
			await safeDelete(() => client.deleteTeam(teamId), "team");
		}
	});

	test("delete user", async () => {
		const { userId } = readState();
		if (userId) {
			await safeDelete(() => client.deleteUser(userId), "user");
		}
	});

	test("delete website", async () => {
		const { websiteId } = readState();
		if (websiteId) {
			await safeDelete(() => client.deleteWebsite(websiteId), "website");
		}
	});

	test("reset state file", () => {
		resetState();
	});
});
